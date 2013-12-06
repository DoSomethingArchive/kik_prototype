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
  selected_by: String,
  thumbnail: String,
  username: String,
});

// Models
var UserModel = mongoose.model('User', UserSchema);

/**
 * Log in the database that a user has selected for a question, and by whome
 *
 * @param object requestBody
 */
var saveToSelectedBy = function(requestBody) {
  // Try to find if the selected user already has a doc
  UserModel.findOne(
    {username: requestBody.answer},
    function(err, doc) {
      if (err)
        return console.log(err);

      var userData = {
        username: requestBody.answer,
        selected_by: {}
      };

      // The user has an already existing doc
      if (doc && doc.selected_by) {
        userData.selected_by = JSON.parse(doc.selected_by);
      }

      if (!userData.selected_by[requestBody.question]) {
        userData.selected_by[requestBody.question] = [];
      }

      // Push username and thumbnail into selectedBy array for the given question
      userData.selected_by[requestBody.question].push(requestBody.username);

      // Convert selected_by back into a JSON string
      userData.selected_by = JSON.stringify(userData.selected_by);

      // Update the already existing doc if there is one
      if (doc) {
        UserModel.update(
          {username: userData.username},
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

        console.log('Updating %s user\'s selected_by field...', userData.username);
      }
      // Otherwise, create a new one
      else {
        var user = new UserModel(userData);
        user.save(function(err) {
          if (!err)
            return console.log('Save successful.');
          else
            return console.log(err);
        });

        console.log('Saving User Model for %s ...', userData.username);
      }
    }
  );
};

/**
 * Create or update the user model for the user in the request.body.
 *
 * @param request object
 * @param response object
 */
var saveUserModel = function(request, response) {
  // Try to find a doc for this username
  UserModel.findOne(
    {username: request.body.username},
    function(err, doc) {
      var userData = {username: request.body.username};

      if (err)
        return response.send(500, err);

      if (request.body.question && request.body.answer) {
        // Add new question/answer pair
        var answers = {};
        if (doc && doc.answers) {
          answers = JSON.parse(doc.answers) || {};
        }
        answers[request.body.question] = request.body.answer;

        // Convert to JSON string to save into database
        userData['answers'] = JSON.stringify(answers);
      }

      if (request.body.push_token) {
        userData['push_token'] = request.body.push_token;
      }

      if (request.body.thumbnail) {
        userData['thumbnail'] = request.body.thumbnail;
      }

      // Previous doc has been found, so update with new data
      if (doc) {
        UserModel.update(
          {username: request.body.username},
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

        console.log('Updating User Model for %s ...', userData.username);
      }
      // Otherwise, create a new one
      else {
        var user = new UserModel(userData);
        user.save(function(err) {
          if (!err)
            return console.log('Save successful.');
          else
            return console.log(err);
        });

        console.log('Saving User Model for %s ...', userData.username);
      }
    }
  );
}


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
  console.dir(request.body);

  if (!request.body.username) {
    return response.send(400, 'Missing a username.');
  }

  // If a question and answer have been submitted with this POST, then log
  // to the selected user's selected_by field.
  if (request.body.question && request.body.answer) {
    saveToSelectedBy(request.body);
  }

  // Save or update the doc for this user
  saveUserModel(request, response);

  return response.send(request.body);
});
