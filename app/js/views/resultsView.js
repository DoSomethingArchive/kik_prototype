define(
  [
    'jquery',
    'underscore',
    'backbone',
    'text!templates/results.html'
  ],

  function($, _, Backbone, template) {
    var ResultsView = Backbone.View.extend({
      events: {
        'click .restart': 'restart',
        'click .share': 'share',
      },

      template: '',

      // Data to package into a Kik card for sharing
      answers: [],
      questionSet: -1,

      el: $('#page-content'),

      /**
       * Render the View to the DOM.
       *
       * @param int set
       * @param Backbone.Model model
       * @param array answers
       * @param array friendAnswers
       */
      render: function(set, model, answers, friendAnswers) {
        data = {};
        data.model = model.attributes;
        data.set = set;
        data.answers = answers;
        data.friendAnswers = friendAnswers;

        this.answers = answers;
        this.questionSet = set;

        this.$el.empty();
        this.$el.append(_.template(template,data));
      },

      /**
       * Restart the question set.
       */
      restart: function(evt) {
        AppRouter.restart();
      },

      /**
       * Create Kik card to share results with friends.
       */
      share: function(evt) {
        console.log('share button clicked');
        console.log('answers: ' + JSON.stringify(this.answers));

        if (cards.kik !== undefined) {
          cards.kik.send({
            'title': 'DS Kik Card Test',
            'text': 'More mobile team, please.',
            'data': {set: this.questionSet, answers: this.answers},
          });
        }
      },
    });

    return ResultsView;
  }
);
