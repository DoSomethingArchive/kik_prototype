define(
  [
    'jquery',
    'underscore',
    'backbone',
    'storage',
    'text!templates/question.html'
  ],

  function($, _, Backbone, Storage, template) {
    var QuestionView = Backbone.View.extend({
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

        tplData = {
          question: dataModel.attributes[questionNum].question,
          friends: Storage.getFriendsList(),
        };

        this.$el.empty();
        this.$el.append(_.template(template, tplData));
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
        choice = this.extractChoiceFromEvent(evt);
        var friends = Storage.getFriendsList();
        var selectedUsername = friends[choice].username;
        console.log("Choice selected: " + selectedUsername);

        Storage.setQuestionAnswer(AppRouter.getQuestion(), selectedUsername);

        // Transition to the results screen
        AppRouter.goToResults();
      },

      /**
       * Returns the choice selected based on the id name of the target clicked.
       */
      extractChoiceFromEvent: function(event) {
        targetId = event.currentTarget.id;
        return targetId.substring("choice-".length);
      }
    });

    return QuestionView;
  }
);
