define(
  [
    'jquery',
    'underscore',
    'backbone',
    'text!templates/dashboard.html'
  ],

  function($, _, Backbone, template) {
    var DashboardView = Backbone.View.extend({
      events: {
        'click #startQuiz': 'startQuiz',
        'click #testGetAnonUser': 'testGetAnonUser',
        'click #testGetUser': 'testGetUser',
        'click #testPickUsers': 'testPickUsers',
        'click #testOpenConversation': 'testOpenConversation',
        'click #testShowProfile': 'testShowProfile',
        'click #testPushGetToken': 'testPushGetToken',
      },

      template: '',

      el: $('#page-content'),

      render: function() {
        this.$el.empty();
        this.$el.append(_.template(template));
      },

      startQuiz: function() {
        AppRouter.startQuestionSet();
      },

      /**
       * Kik API tests
       */
      testGetAnonUser: function() {
        if (cards.kik && cards.kik.getAnonymousUser) {
          cards.kik.getAnonymousUser(function(token) {
            if (!token)
              return;

            console.log('cards.kik.getAnonymousUser(): ' + token);
          });
        }
      },

      testGetUser: function() {
        if (cards.kik && cards.kik.getUser) {
          cards.kik.getUser(function(user) {
            if (!user)
              return;

            console.log('\n\ncards.kik.getUser()');
            console.log('    username: ' + user.username);
            console.log('    fullName: ' + user.fullName);
            console.log('    lastName: ' + user.lastName);
            console.log('    pic: ' + user.pic);
            console.log('    thumbnail: ' + user.thumbnail);
            console.log('\n\n');
          });
        }
      },

      testPickUsers: function() {
        if (cards.kik && cards.kik.pickUsers) {
          cards.kik.pickUsers({
              minResults: 3,
              maxResults: 3
            },
            function(users) {
              if (!users)
                return;

              console.log('\n\ncards.kik.pickUsers()');
              users.forEach(function(user) {
                console.log('    --------');
                console.log('    username: ' + user.username);
                console.log('    fullName: ' + user.fullName);
                console.log('    lastName: ' + user.lastName);
                console.log('    pic: ' + user.pic);
                console.log('    thumbnail: ' + user.thumbnail);
              });
              console.log('\n\n');
            }
          );
        }

      },

      testOpenConversation: function() {
        if (cards.kik && cards.kik.pickUsers && cards.kik.openConversation) {
          cards.kik.pickUsers({
              minResults: 1,
              maxResults: 1
            },
            function(users) {
              if (!users)
                return;

              user = users[0];
              console.log('Opening conversation for: ' + user.username);
              cards.kik.openConversation(user.username);
            }
          );
        }
      },

      testShowProfile: function() {
        if (cards.kik && cards.kik.pickUsers && cards.kik.showProfile) {
          cards.kik.pickUsers(
            {
              minResults: 1,
              maxResults: 1
            },
            function(users) {
              if (!users)
                return;

              user = users[0];
              console.log('Showing profile for: ' + user.username);
              cards.kik.showProfile(user.username);
            }
          );
        }
      },

      testPushGetToken: function() {
        if (cards.push && cards.push.getToken) {
          cards.push.getToken(function(token) {
            if (!token)
              return;

            console.log('cards.push.getToken(): ' + token);
          });
        }
      }
    });

    return DashboardView;
  }
);
