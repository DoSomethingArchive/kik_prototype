define(
  [
    'underscore',
    'backbone'
  ],

  function(_, Backbone) {
    var QuestionsModel = Backbone.Model.extend({
      url: 'data/questions.json',
    });

    return QuestionsModel;
  }
);
