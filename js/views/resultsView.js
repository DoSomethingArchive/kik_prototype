define(
  [
    'jquery',
    'underscore',
    'backbone',
    'text!templates/results.html'
  ],

  function($, _, Backbone, template) {
    var ResultsView = Backbone.View.extend({
      template: '',

      el: $('#page-content'),

      /**
       * Render the View to the DOM
       *
       * @param int set
       * @param Backbone.Model model
       * @param array answers
       */
      render: function(set, model, answers) {
        data = {};
        data.questions = model.attributes;
        data.set = set;
        data.answers = answers;

        this.$el.empty();
        this.$el.append(_.template(template,data));
      }
    });

    return ResultsView;
  }
);
