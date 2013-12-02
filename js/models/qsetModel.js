define(
  [
    'jquery',
    'underscore',
    'backbone'
  ],

  function($, _, Backbone) {
    var QSetModel = Backbone.Model.extend({
      url: '',

      initialize: function() {
        this.questionSet = 0;
      },

      getQuestionSet: function() {
        return this.questionSet;
      },

      setQuestionSet: function(setNumber) {
        this.questionSet = setNumber;

        this.url = 'data/qset_' + setNumber + '.json';
      },
    });

    return QSetModel;
  }
);
