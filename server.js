// Module dependencies
var application_root = __dirname,
    express = require('express'),   // Web framework
    path = require('path'),         // Utilities for dealing with file paths
    mongoose = require('mongoose'); // MongoDB integration

////////////////////
// Database Setup //
////////////////////

// Setup Mongo database connection, schemas, and models
mongoose.connect('mongodb://localhost/kik_prototype_db');

// Schemas
var UserSchema = new mongoose.Schema({
  answers: String,
  push_token: String,
  thumbnail: String,
  username: String,
});

// Models
var UserModel = mongoose.model('User', UserSchema);


///////////////////
// Express Setup //
///////////////////

// Create server
var app = express();

// Configure server
app.configure(function() {
  // Parses request body and populates request.body
  app.use(express.bodyParser());

  // Checks request.body for HTTP method override
  app.use(express.methodOverride());

  // Perform route lookup based on url and HTTP method
  app.use(app.router);

  // Where to serve static content
  app.use(express.static(path.join(application_root, '/app')));

  // Show all errors in development
  app.use(express.errorHandler({dumpException: true, showStack: true}));
});

// Start server
var port = 4711;
app.listen(port, function() {
  console.log('Express server listening on port %d in %s mode...\n\n', port, app.settings.env);
});

////////////
// Routes //
////////////

app.get('/api', function(request, response) {
  response.send('hello api');
});

/**
 * POST /api/user
 * Creates or updates a user's model to the database.
 */
app.post('/api/user', function(request, response) {

  console.log('\n\nPOST /api/user:');
  console.log('    request.body.answers: ' + request.body.answers);
  console.log('    request.body.push_token: ' + request.body.push_token);
  console.log('    request.body.thumbnail: ' + request.body.thumbnail);
  console.log('    request.body.username: ' + request.body.username);

  var userAnswers = request.body.answers,
      userPushToken = request.body.push_token,
      userThumbnail = request.body.thumbnail,
      userUsername = request.body.username;

  // Find previously submitted data from the same user
  UserModel.findOne(
    {username: request.body.username},
    function(err, doc) {
      var createDoc = true;

      // Found a previous doc for this username
      if (!err && doc) {
        createDoc = false;

        // Old answers from this user found in the database
        userAnswers = JSON.parse(doc.answers);

        // New answers from the POST request
        requestAnswers = JSON.parse(request.body.answers);

        // Merge the two sets of answers
        for(var key in requestAnswers) {
          userAnswers[key] = requestAnswers[key];
        }

        // Convert back to string to save to database
        userAnswers = JSON.stringify(userAnswers);
      }

      var userData = {
        answers: userAnswers,
        push_token: userPushToken,
        thumbnail: userThumbnail,
        username: userUsername
      };

      console.log('User Data:\n');
      console.dir(userData);

      if (createDoc) {
        // Create new UserModel and save to the database
        var user = new UserModel(userData);
        user.save(function(err) {
          if (!err)
            return console.log('Save successful.');
          else
            return console.log(err);
        });

        console.log('Saving User Model...');
      }
      else {
        // Or update the database with the new data for this user
        UserModel.update(
          {username: userUsername},
          userData,
          function(err, numAffected, raw) {
            if (!err) {
              console.log('The number of updated documents was %d', numAffected);
              console.log('The raw response from Mongo was ', raw);
            }
            else {
              console.log(err);
            }
          }
        );

        console.log('Updating User Model...');
      }

      return response.send(userData);
    }
  );
});
