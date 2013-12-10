define(
  [
    'jquery',
    'underscore',
    'backbone',
    'storage',
    'text!templates/profile.html',
  ],

  function($, _, Backbone, Storage, template) {
    var ProfileView = Backbone.View.extend({
      events: {
        'click h1': 'restart',
      },

      el: $('#page-content'),

      questionsModel: {},

      /**
       * Start render process. Make sure all needed data is retrieved.
       *
       * @param object model
       *   The Questions model with all the questions.
       */
      render: function(model) {
        this.questionsModel = model;
        var userData = Storage.getUserData();
        if (!userData && cards.kik && cards.kik.getUser) {
          cards.kik.getUser(function(userData) {
            // Save user data to local storage
            Storage.setUserData(userData);

            // Get user data from API service
            this.fetchUserData(userData.username);
          });
        }
        else {
          // Get user data from API service
          this.fetchUserData(userData.username);
        }
      },

      /**
       * Retrieve user data from the API and render to the DOM.
       *
       * @param string username
       */
      fetchUserData: function(username) {
        var view = this;
        $.get(
          AppRouter.apiGetUserUrl(),
          {user: username},
          function(data) {
            var viewData = {
              results: [],
            };

            // Build data set of questions and users
            if (data.selected_by !== undefined) {
              var selectedBy = JSON.parse(data.selected_by);
              var questions = Object.keys(selectedBy);
              for (var i = 0; i < questions.length; i++) {
                var qIndex = questions[i];

                viewData.results[i] = {};
                // Sorta hacky - some questions are HTML, some are not. So the added
                // divs just ensure that it's always HTML we've got and that jQuery
                // can process it.
                var questionHtml = '<div>' + view.questionsModel.attributes[qIndex].question + '</div>';
                viewData.results[i].question = $(questionHtml).text();

                viewData.results[i].selectedBy = [];
                for (var j = 0; j < selectedBy[questions[i]].length; j++) {
                  viewData.results[i].selectedBy[j] = {};
                  viewData.results[i].selectedBy[j].username = selectedBy[qIndex][j].username;
                  viewData.results[i].selectedBy[j].thumbnail = selectedBy[qIndex][j].thumbnail;
                }
              }
            }

            // Render the user data
            view.$el.empty();
            view.$el.append(_.template(template, viewData));
          }
        );
      },

      /**
       * Go back to the dashboard
       */
      restart: function(evt) {
        AppRouter.restart();
      },
    });

    return ProfileView;
  }
);
