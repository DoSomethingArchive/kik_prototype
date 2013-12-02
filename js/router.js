define(
  [
    'jquery',
    'underscore',
    'backbone',
    'models/qsetModel',
    'views/qsetView'
  ],

  function($, _, Backbone, QSetModel, QSetView) {
    var Router = Backbone.Router.extend({
      routes: {
        '': 'showDashboard',
        'qset/:setNum/:questionNum': 'showQSet',
        'results': 'showResults',
      },

      initialize: function() {
        Backbone.history.start();
      },

      /**
       * Show user's dashboard/home view.
       */
      showDashboard: function() {
        // @todo Decide whether to start new question set or show user dashboard
        //   For now, just launch into the qset
        window.location.href += '#qset/1/0';
      },

      /**
       * Display the question set.
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

      showResults: function() {
        console.log('showResults()');
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
          '#results';
      },

    });

    return Router;
  }
);
