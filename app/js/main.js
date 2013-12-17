require.config({
  paths: {
    jquery: 'libs/jquery_2.0.3',
    underscore: 'libs/underscore_1.5.2',
    backbone: 'libs/backbone_1.1.0',
    text: 'libs/text_2.1.10',
    cards: 'libs/cards_0.11.2',
  },
  shim: {
    underscore: {
      deps: [],
      exports: '_'
    },
    backbone: {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone'
    },
    cards: {
      deps: [],
      exports: 'cards'
    },
  }
});

require(['views/app'], function(AppView) {
  var app_view = new AppView();
});
