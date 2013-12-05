define(
  [
    'jquery',
    'underscore',
    'backbone',
    'storage',
    'models/questionsModel',
    'views/dashboardView',
    'views/questionView',
    'views/resultsView',
    'views/testView',
  ],

  function($, _, Backbone, Storage, QuestionsModel, DashboardView, QuestionView, ResultsView, TestView) {
    var Router = Backbone.Router.extend({
      routes: {
        '': 'showDashboard',
        'question/:questionNum' : 'showQuestion',
        'results/:questionNum': 'showResults',
        'test': 'showTest',
      },

      // Data received when app is opened from a shared Kik card
      receivedMessage: {},

      initialize: function() {
        Backbone.history.start();
      },

      /**
       * Return to the dashboard screen
       */
      restart: function() {
        window.location.href = window.location.origin + window.location.pathname;
      },

      /**
       * Show user's dashboard/home view.
       */
      showDashboard: function() {
        // Opened through a Kik card message
        if (cards.kik !== undefined && cards.kik.message) {
          console.log('\n\nOpened through a Kik card:');
          console.log('  question: ' + cards.kik.message.question);
          console.log('  friend\'s answers: ' + JSON.stringify(cards.kik.message.answers));
          console.log('\n\n');

          Storage.setFriendResults(cards.kik.message.set, cards.kik.message.answers);
          var questionNum = cards.kik.message.question;

          var url = window.location.origin + window.location.pathname +
            '#question/' + questionNum;
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

          // Clear any friend results
          Storage.clearFriendResults();

          var dashboardView = new DashboardView();
          dashboardView.render();
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
          this.resultsView = new ResultsView();
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

          var url = window.location.origin + window.location.pathname +
            '#qset/' + questionSet + '/0';
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

          // Clear any friend results
          Storage.clearFriendResults();

          var testView = new TestView();
          testView.render();
        }
      },

      /**
       * Change URL to go to the next question in this set
       */
      goToNextQuestion: function() {
        var question = 0 ;
        if (window.location.hash.length > 0) {
          hashVals = window.location.hash.split('/');
          // hashVals[0] => '#question'
          question = parseInt(hashVals[1], 10) + 1; // increment the question index
        }

        window.location.href = window.location.origin + window.location.pathname +
          '#question/' + question;
      },

      /**
       * Change URL to the results page
       */
      goToResults: function() {
        window.location.href = window.location.origin + window.location.pathname +
          '#results' + '/' + this.getQuestion();
      },

      /**
       * Get the question index from the URL.
       */
      getQuestion: function() {
        hashVals = window.location.hash.split('/');
        return hashVals[1];
      },

      /**
       * Get the URL for the user API.
       */
      apiGetUserUrl: function() {
        return window.location.origin + window.location.pathname + 'api/user';
      },


    });

    return Router;
  }
);
