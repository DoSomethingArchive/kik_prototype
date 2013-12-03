define(
  [
    'jquery',
    'underscore',
    'backbone',
    'storage',
    'text!templates/qset.html'
  ],

  function($, _, Backbone, Storage, template) {
    var QSetView = Backbone.View.extend({
      events: {
        'click .choice': 'selectChoice',
        'click .restart': 'restart',
      },

      currentQuestion: -1,
      dataModel: {},
      template: '',

      // DOM element to append the qset view to.
      el: $('#page-content'),

      /**
       * Render the View to the DOM.
       *
       * @param int questionNum
       *   Index of the question to display.
       * @param  Backbone.Model dataModel
       *   Model containing info for the question set.
       */
      render: function(questionNum, dataModel) {
        this.dataModel = dataModel;
        this.currentQuestion = parseInt(questionNum, 10);

        this.$el.empty();
        this.$el.append(_.template(template, dataModel.attributes[questionNum]));
      },

      /**
       * Restart the question set.
       */
      restart: function(evt) {
        AppRouter.restart();
      },

      /**
       * Click event callback for selecting a choice.
       */
      selectChoice: function(evt) {
        selected = this.extractChoiceFromEvent(evt);
        Storage.setQuestionResult(AppRouter.getSet(), AppRouter.getQuestion(), selected);
        console.log("choice selected: " + selected);

        // If there's a next question, show next question. Otherwise, show results.
        nextQuestionIndex = this.currentQuestion + 1;
        if (this.dataModel.attributes[nextQuestionIndex] === undefined) {
          AppRouter.goToResults();
        }
        else {
          AppRouter.nextQuestion();
        }
      },

      /**
       * Returns the choice selected based on the id name of the target clicked.
       */
      extractChoiceFromEvent: function(event) {
        targetId = event.currentTarget.id;
        return targetId.substring("choice-".length);
      }
    });

    return QSetView;
  }
);
