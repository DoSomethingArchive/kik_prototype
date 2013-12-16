define(
  [
    'jquery',
    'underscore',
    'backbone',
    'storage',
    'models/questionsModel',
    'views/dashboardView',
    'views/profileView',
    'views/questionView',
    'views/resultsView',
    'views/testView',
  ],

  function($, _, Backbone, Storage, QuestionsModel, DashboardView, ProfileView, QuestionView, ResultsView, TestView) {
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

        return this.bind('route', this._trackPageview);
      },

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
        var question = 0 ;
        if (this.nextQuestionOverride) {
          question = this.nextQuestionOverride;
          this.nextQuestionOverride = undefined;
        }
        else if (window.location.hash.length > 0) {
          hashVals = window.location.hash.split('/');
          question = parseInt(hashVals[1], 10) + 1; // increment the question index
        }

        window.location.href = this.getBaseUrl() + '#question/' + question;
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
