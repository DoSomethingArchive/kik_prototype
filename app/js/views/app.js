var AppRouter = AppRouter || {};

define([
    'jquery',
    'underscore',
    'backbone',
    'router'
  ],
  function($, _, Backbone, Router) {
    var AppView = Backbone.View.extend({
      initialize: function() {
        AppRouter = new Router();

        // Lock orientation
        if (cards.browser && cards.browser.setOrientationLock) {
          cards.browser.setOrientationLock('portrait');
        }
      }
    });

    return AppView;
  }
);
