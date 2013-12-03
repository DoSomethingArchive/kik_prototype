define(
  [
    'jquery',
    'underscore',
    'backbone',
    'storage',
    'models/qsetModel',
    'views/dashboardView',
    'views/qsetView',
    'views/resultsView',
  ],

  function($, _, Backbone, Storage, QSetModel, DashboardView, QSetView, ResultsView) {
    var Router = Backbone.Router.extend({
      routes: {
        '': 'showDashboard',
        'qset/:setNum/:questionNum': 'showQSet',
        'results/:setNum': 'showResults',
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
          // @todo Start qset if no previously taken qset is found

          // Clear any friend results
          Storage.clearFriendResults();

          var dashboardView = new DashboardView();
          dashboardView.render();
        }
      },

      /**
       * Display the question set.
       *
       * @param int setNum
       *   Question set number to display.
       * @param int questionNum
       *   Index in that question set to display.
       */
      showQSet: function(setNum, questionNum) {

        var onModelFetched = function(data) {
          this.qsetView = this.qsetView || new QSetView();
          this.qsetView.render(questionNum, data);
        };

        if (this.qsetModel === undefined || this.qsetModel.getQuestionSet() != setNum) {
          this.qsetModel = new QSetModel();
          this.qsetModel.setQuestionSet(setNum);

          this.qsetModel.fetch({success:onModelFetched});
        }
        else {
          onModelFetched(this.qsetModel);
        }
      },

      /**
       * Display the results View.
       *
       * @param int setNum
       *   Question set number to show results for.
       */
      showResults: function(setNum) {
        var onModelFetched = function(data) {
          var results = Storage.getResults(setNum);

          var friendAnswers = Storage.getFriendResults(setNum);

          this.resultsView = new ResultsView();
          this.resultsView.render(setNum, data, results, friendAnswers);
        };

        if (this.qsetModel === undefined || this.qsetModel.getQuestionSet() != setNum) {
          this.qsetModel = new QSetModel();
          this.qsetModel.setQuestionSet(setNum);

          this.qsetModel.fetch({success:onModelFetched});
        }
        else {
          onModelFetched(this.qsetModel);
        }
      },

      startQuestionSet: function() {
        // Choose a question set
        // Then change URL to go to that question set
        window.location.href = window.location.origin + window.location.pathname +
          '#qset/1/0';
      },

      /**
       * Change URL to go to the next question in this set
       */
      nextQuestion: function() {
        hashVals = window.location.hash.split('/');
        hashBase = hashVals[0]; // '#qset'
        hashSet = hashVals[1];
        hashQuestion = parseInt(hashVals[2], 10) + 1; // increment the question index

        // Remove last number
        window.location.href = window.location.origin + window.location.pathname +
          hashBase +
          '/' + hashSet +
          '/' + hashQuestion;
      },

      /**
       * Change URL to the results page
       */
      goToResults: function() {
        window.location.href = window.location.origin + window.location.pathname +
          '#results' + '/' + this.getSet();
      },

      /**
       * Get the question index from the URL.
       */
      getQuestion: function() {
        hashVals = window.location.hash.split('/');
        return hashVals[2];
      },

      /**
       * Get the question set from the URL.
       */
      getSet: function() {
        hashVals = window.location.hash.split('/');
        return hashVals[1];
      },


    });

    return Router;
  }
);
