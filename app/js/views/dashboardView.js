define(
  [
    'jquery',
    'underscore',
    'backbone',
    'storage',
    'cards',
    'text!templates/dashboard.html',
    'text!templates/friendsList.html',
  ],

  function($, _, Backbone, Storage, cards, tplDashboard, tplFriendsList) {
    var DashboardView = Backbone.View.extend({
      events: {
        'click #pickFriends': 'pickFriends',
        'click #startQuestions': 'startQuestions',
        'click #reset': 'reset',
        'click .profileIcon': 'profile',
      },

      el: $('#page-content'),

      initialize: function() {
        console.log('DashboardView.initialize()');
      },

      render: function() {
        this.$el.empty();
        this.$el.append(_.template(tplDashboard));

        // On initial render, header section should take up the entire screen
        this.headerFillScreen();

        var friends = Storage.getFriendsList();
        if (friends) {
          this.displayFriends(friends, this);
        }
      },

      headerFillScreen: function() {
        var dashboardHeader = $('.dashboardHeader');
        var headerHeight = $(window).height() - dashboardHeader.offset().top;

        this.originalHeight = dashboardHeader.height();
        dashboardHeader.height(headerHeight);
      },

      pickFriends: function() {
        var view = this;

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
                  user.thumbnail = 'img/kik-icon_256x256.png';
                }

                // Cull out unneeded data (to minimize data saved to localStorage)
                delete user.fullName;
                delete user.lastName;
                delete user.pic;
              });

              // Save users to localStorage for later use in questions
              Storage.setFriendsList(users);

              view.displayFriends(users, view);
            }
          );
        }
        // If no Kik api, then just populate with dummy data to test template with
        else {
          var dummyData = {
            users: [
              {
                username: 'shishab',
                thumbnail: '//d33vud085sp3wg.cloudfront.net/xZRqqPCumIZnDH9jcjMk1O1IR-o/thumb.jpg'
              },
              {
                username: 'test_user_2',
                thumbnail: 'img/kik-icon_256x256.png'
              },
              {
                username: 'test_user_3',
                thumbnail: 'img/kik-icon_256x256.png'
              }
            ]
          };

          Storage.setFriendsList(dummyData.users);

          var friendsList = $('#friends-list');
              friendsList.empty();
              friendsList.append(_.template(tplFriendsList, dummyData));

          $('#pickFriends').hide();
          $('#startQuestions').show();
          $('#reset').show();

          // Animate header section back to original height in order to reveal
          // the selected friends section.
          $('.dashboardHeader').css('height', view.originalHeight);
        }
      },

      /**
       * Display the friends section of the page.
       *
       * @param friends Array of friend data to display
       * @param view View handle
       */
      displayFriends: function(friends, view) {
        // Update the display with the selected friends
        var data = {users: friends};
        var friendsList = $('#friends-list');
        friendsList.empty();
        friendsList.append(_.template(tplFriendsList, data));

        // Hide the friend picker button and show the button to get started
        $('#pickFriends').hide();
        $('#startQuestions').show();
        $('#reset').show();

        // Animate header section back to original height in order to reveal
        // the selected friends section.
        $('.dashboardHeader').css('height', view.originalHeight);
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

            var userData = {
              thumbnail: user.thumbnail,
              username: user.username
            };

            // Save the username and thumbnail to the server
            $.post(
              AppRouter.apiGetUserUrl(),
              userData,
              function(data, textStatus, jqXHR) {
                console.dir(data);
                console.log(textStatus);

                // Then save the user push token to the server
                if (cards.push && cards.push.getToken) {
                  cards.push.getToken(function(token) {
                    if (!token)
                      return;

                    console.log('cards.push.getToken(): ' + token);

                    // Save the push token to localStorage
                    Storage.setPushToken(token);

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
                      }
                    );
                  });
                }
              }
            );

            // Start the questions
            AppRouter.goToNextQuestion();
          });
        }
        // If this is from a desktop page for dev, just start the questions
        else {
          AppRouter.goToNextQuestion();
        }
      },

      profile: function(evt) {
        AppRouter.goToProfile();
      },

      /**
       * Reset the dashboard view
       */
      reset: function(evt) {
        $('#friends-list').empty();
        $('#pickFriends').show();
        $('#startQuestions').hide();
        $('#reset').hide();

        Storage.clearFriendsList();

        this.headerFillScreen();
      },
    });

    return DashboardView;
  }
);
