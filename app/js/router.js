define(
  [
    'jquery',
    'underscore',
    'backbone',
    'storage',
    'cards',
    'models/questionsModel',
    'views/dashboardView',
    'views/profileView',
    'views/questionView',
    'views/resultsView',
    'views/testView',
  ],

  function($, _, Backbone, Storage, cards, QuestionsModel, DashboardView, ProfileView, QuestionView, ResultsView, TestView) {
    var Router = Backbone.Router.extend({
      routes: {
        '': 'showDashboard',
        'profile': 'showProfile',
        'question/:questionNum' : 'showQuestion',
        'results/:questionNum': 'showResults',
        'test': 'showTest',
      },

      // Data received when app is opened from a shared Kik card
      receivedMessage: {},

      initialize: function() {
        Backbone.history.start();

        // Enables Kik event tracking for Google Analytics
        if (cards.metrics) {
          cards.metrics.enableGoogleAnalytics();
        }

        // Bind routing events to track page views
        return this.bind('route', this._trackPageview);
      },

      /**
       * Tracks a pageview to Google Analytics.
       */
      _trackPageview: function() {
        var url;
        url = Backbone.history.getFragment();
        return ga('send', 'pageview', '/#' + url);
      },

      /**
       * Return to the dashboard screen
       */
      restart: function() {
        window.location.href = this.getBaseUrl();
      },

      /**
       * Show user's dashboard/home view.
       */
      showDashboard: function() {
        // Opened through a Kik card message
        if (cards.kik !== undefined && cards.kik.message) {
          console.log('\n\nOpened through a Kik card:');
          console.log('  question: ' + cards.kik.message.question);
          console.log('\n\n');

          // Send user to the shared question
          this.nextQuestionOverride = cards.kik.message.question;
        }
        else {
          // Handle push notification data
          if (cards.push && cards.push.handler) {
            cards.push.handler(function(data) {
              if (!data)
                return;

              var strData = JSON.stringify(data);
              console.log("Push notification data received: " + strData);
            });
          }
        }

        $('#loading').hide();
        var dashboardView = new DashboardView();
        dashboardView.render();
      },

      /**
       * Display the profile page.
       */
      showProfile: function() {
        var onModelFetched = function(model) {
          this.profileView = this.profileView || new ProfileView();
          this.profileView.render(model);
        };

        // Need questions data
        if (!this.questionsModel) {
          this.questionsModel = new QuestionsModel();
          this.questionsModel.fetch({success:onModelFetched});
        }
        else {
          onModelFetched(this.questionsModel);
        }
      },

      /**
       * Display the question.
       *
       * @param int questionNum
       */
      showQuestion: function(questionNum) {
        var onModelFetched = function(model) {
          this.questionView = this.questionView || new QuestionView();
          this.questionView.render(questionNum, model);
        };

        if (!this.questionsModel) {
          this.questionsModel = new QuestionsModel();
          this.questionsModel.fetch({success:onModelFetched});
        }
        else {
          onModelFetched(this.questionsModel);
        }
      },

      /**
       * Display the results View.
       *
       * @param int questionNum
       */
      showResults: function(questionNum) {
        var onModelFetched = function(data) {
          this.resultsView = this.resultsView || new ResultsView();
          this.resultsView.render(questionNum, data);
        };

        if (!this.questionsModel) {
          this.questionsModel = new QuestionsModel();
          this.questionsModel.fetch({success:onModelFetched});
        }
        else {
          onModelFetched(this.questionsModel);
        }
      },

      /**
       * Display the test screen
       */
      showTest: function() {
        // Opened through a Kik card message
        if (cards.kik !== undefined && cards.kik.message) {
          console.log('\n\nOpened through a Kik card:');
          console.log('  question set: ' + cards.kik.message.set);
          console.log('  friend\'s answers: ' + JSON.stringify(cards.kik.message.answers));
          console.log('\n\n');

          Storage.setFriendResults(cards.kik.message.set, cards.kik.message.answers);
          var questionSet = cards.kik.message.set;

          var url = this.getBaseUrl() + '#qset/' + questionSet + '/0';
          console.log('url: ' + url);
          window.location.href = url;
        }
        else {
          // Handle push notification data
          if (cards.push && cards.push.handler) {
            cards.push.handler(function(data) {
              if (!data)
                return;

              var strData = JSON.stringify(data);
              console.log("Push notification data received: " + strData);
            });
          }

          var testView = new TestView();
          testView.render();
        }
      },

      /**
       * Change URL to go to the next question in this set
       */
      goToNextQuestion: function() {
        var onModelFetched = function(model) {
          var question = 0 ;
          if (AppRouter.nextQuestionOverride) {
            question = AppRouter.nextQuestionOverride;
            AppRouter.nextQuestionOverride = undefined;
          }
          else if (model) {
            // Get # of available questions
            var numQuestions = 0
            for (var keys in model.attributes) {
              numQuestions++;
            }

            // Get an array of the questions asked
            var questionsAsked = Storage.getQuestionsAsked();

            // If the user's already been asked all the questions, clear the cache and start over
            if (questionsAsked && questionsAsked.length == numQuestions) {
              Storage.clearQuestionsAsked();
              questionsAsked = [];
            }

            var questionSelected = false;
            while (!questionSelected) {
              // Randomly select a # in the range of available questions
              var randomNum = Math.floor(Math.random() * numQuestions);
              randomNum = randomNum.toString();

              // Use the question if it's not found in the list of questions asked
              if (!questionsAsked || questionsAsked.indexOf(randomNum) == -1) {
                questionSelected = true;
                question = randomNum;
              }
            }
          }
          else if (window.location.hash.length > 0) {
            hashVals = window.location.hash.split('/');
            question = parseInt(hashVals[1], 10) + 1; // increment the question index
          }

          window.location.href = AppRouter.getBaseUrl() + '#question/' + question;
        };

        if (!this.questionsModel) {
          this.questionsModel = new QuestionsModel();
          this.questionsModel.fetch({success:onModelFetched});
        }
        else {
          onModelFetched(this.questionsModel);
        }
      },

      /**
       * Change URL to the profile page.
       */
      goToProfile: function() {
        window.location.href = this.getBaseUrl() + '#profile';
      },

      /**
       * Change URL to the results page
       */
      goToResults: function() {
        window.location.href = this.getBaseUrl() + '#results' + '/' + this.getQuestionNum();
      },

      /**
       * Get the question index from the URL.
       */
      getQuestionNum: function() {
        hashVals = window.location.hash.split('/');
        return hashVals[1];
      },

      /**
       * Get the actual question text from the model.
       *
       * @param int questionNum
       */
      getQuestionText: function(questionNum) {
        if (this.questionsModel) {
          return this.questionsModel.attributes[questionNum].question;
        }
        else {
          return null;
        }
      },

      /**
       * Get the base Url.
       * Saw some weird behavior across different phones. Some had no problem
       * with the window.location.*, and some would just return undefined.
       */
      getBaseUrl: function() {
        var url = '';
        if (window.location.origin) {
          url += window.location.origin;
        }

        if (window.location.pathname) {
          url += window.location.pathname;
        }

        return url;
      },

      /**
       * Get the URL for the user API.
       */
      apiGetUserUrl: function() {
        return this.getBaseUrl() + 'api/user';
      },


    });

    return Router;
  }
);
