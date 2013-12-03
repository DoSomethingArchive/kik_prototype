// Module dependencies
var application_root = __dirname,
    express = require('express'),   // Web framework
    path = require('path'),         // Utilities for dealing with file paths
    mongoose = require('mongoose'); // MongoDB integration

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
  console.log('Express server listening on port %d in %s mode', port, app.settings.env);
});

app.get('/api', function(request, response) {
  response.send('hello api');
});
