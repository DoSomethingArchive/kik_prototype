define(
  [
    'jquery',
    'underscore',
    'backbone',
    'storage',
    'text!templates/dashboard.html',
    'text!templates/friendsList.html',
  ],

  function($, _, Backbone, Storage, tplDashboard, tplFriendsList) {
    var DashboardView = Backbone.View.extend({
      events: {
        'click #pickFriends': 'pickFriends',
        'click #startQuestions': 'startQuestions',
        'click .restart': 'reset',
      },

      el: $('#page-content'),

      initialize: function() {
        console.log('DashboardView.initialize()');
      },

      render: function() {
        this.$el.empty();
        this.$el.append(_.template(tplDashboard));
      },

      pickFriends: function() {
        if (cards.kik && cards.kik.pickUsers) {
          cards.kik.pickUsers({
              minResults: 3,
              maxResults: 5
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

              users.forEach(function(user) {
                // If user does not have a thumbnail, replace it with a default
                if (!user.thumbnail) {
                  user.thumbnail = 'img/aaron.jpg';
                }

                // Cull out unneeded data (to minimize data saved to localStorage)
                delete user.fullName;
                delete user.lastName;
                delete user.pic;
              });

              // Save users to localStorage for later use in questions
              Storage.setFriendsList(users);

              // Update the display with the selected friends
              var data = {users: users};
              var friendsList = $('#friends-list');
              friendsList.empty();
              friendsList.append(_.template(tplFriendsList, data));

              // Hide the friend picker button and show the button to get started
              $('#pickFriends').hide();
              $('#startQuestions').show();
            }
          );
        }
        // If no Kik api, then just populate with dummy data to test template with
        else {
          var dummyData = {
            users: [
              {
                username: 'test_user_1',
                thumbnail: 'img/aaron.jpg'
              },
              {
                username: 'test_user_2',
                thumbnail: 'img/aaron.jpg'
              },
              {
                username: 'test_user_3',
                thumbnail: 'img/aaron.jpg'
              }
            ]
          };

          Storage.setFriendsList(dummyData.users);

          var friendsList = $('#friends-list');
              friendsList.empty();
              friendsList.append(_.template(tplFriendsList, dummyData));

          $('#pickFriends').hide();
          $('#startQuestions').show();
        }
      },

      startQuestions: function() {
        // Get user data and push token
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

            // Save the user data to localStorage
            Storage.setUserData(user);

            // Save the user data to the server
            var userData = {
              thumbnail: user.thumbnail,
              username: user.username
            };

            $.post(
              AppRouter.apiGetUserUrl(),
              userData,
              function(data, textStatus, jqXHR) {
                console.dir(data);
                console.log(textStatus);
                console.dir(jqXHR);
              }
            );

            // Asynchronously get the push token. This does not need to block
            // the start of the questions.
            if (cards.push && cards.push.getToken) {
              cards.push.getToken(function(token) {
                if (!token)
                  return;

                console.log('cards.push.getToken(): ' + token);

                var user = Storage.getUserData();

                // Save the push_token data to the server
                var userData = {
                  push_token: token,
                  username: user.username
                };

                $.post(
                  AppRouter.apiGetUserUrl(),
                  userData,
                  function(data, textStatus, jqXHR) {
                    console.dir(data);
                    console.log(textStatus);
                    console.dir(jqXHR);
                  }
                );
              });
            }

            // Start the questions
            AppRouter.goToNextQuestion();
          });
        }
        // If this is from a desktop page for dev, just start the questions
        else {
          AppRouter.goToNextQuestion();
        }
      },

      /**
       * Reset the dashboard view
       */
      reset: function(evt) {
        window.location.reload();
      },
    });

    return DashboardView;
  }
);
