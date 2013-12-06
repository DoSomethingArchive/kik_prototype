define(
  [
    'jquery',
    'underscore',
    'backbone',
    'storage',
    'text!templates/results.html',
    'text!templates/selectedBy.html',
  ],

  function($, _, Backbone, Storage, template, tplSelectedBy) {
    var ResultsView = Backbone.View.extend({
      events: {
        'click .nextQuestion': 'nextQuestion',
        'click .restart': 'restart',
        'click .share': 'share',
      },

      template: '',

      el: $('#page-content'),

      /**
       * Render the View to the DOM.
       *
       * @param int questionNum
       * @param Backbone.Model model
       */
      render: function(questionNum, model) {
        var data = {};
        data.model = model.attributes[questionNum];
        data.question = questionNum;
        data.friends = Storage.getFriendsList();

        data.answerUsername = Storage.getQuestionAnswer(questionNum);
        for (var i = 0; i < data.friends.length; i++) {
          if (data.friends[i].username == data.answerUsername) {
            data.answerThumbnail = data.friends[i].thumbnail;
            break;
          }
        }

        this.$el.empty();
        this.$el.append(_.template(template,data));

        // Find out what other people voted on
        this.getFriendUserData();

        // Submit results to server
        this.postAnswer(questionNum, data.answerUsername);
      },

      /**
       * Callback for GET call in getFriendUserData().
       * Uses data retrieved to display who else selected a given person.
       */
      renderFriendData: function(data) {
        if (data.answers)
          data.answers = JSON.parse(data.answers);

        if (data.selected_by) {
          data.selected_by = JSON.parse(data.selected_by);

          var question = AppRouter.getQuestionNum();
          if (data.selected_by[question]) {
            // Remove myself from the list
            var user = Storage.getUserData();
            for (var i = 0; user && i < data.selected_by[question].length; i++) {
              if (data.selected_by[question][i].username == user.username) {
                data.selected_by[question].splice(i, 1);
                break;
              }
            }

            // Update facepile block with remaining users
            if (data.selected_by[question].length > 0) {
              var id = '#' + data.username + '-selectedBy';
              if ($(id)) {
                $(id).empty();

                var tplData = {data: data.selected_by[question]};
                $(id).append(_.template(tplSelectedBy, tplData));
              }
            }
          }
        }
      },

      /**
       * Go to the next question.
       */
      nextQuestion: function() {
        AppRouter.goToNextQuestion();
      },

      /**
       * Get user data for each friend.
       */
      getFriendUserData: function() {
        var friends = Storage.getFriendsList();
        for (var i = 0; i < friends.length; i++) {

          $.get(
            AppRouter.apiGetUserUrl(),
            {user: friends[i].username},
            this.renderFriendData
          );

        }
      },

      /**
       * Send user's answer to the server for tracking.
       *
       * @param question int
       * @param answer string
       */
      postAnswer: function(question, answer) {
        var data = {};

        // Use data from localStorage to build data packet
        if (cards.kik) {
          data = {
            answer: answer,
            question: question
          };

          var userData = Storage.getUserData();
          if (userData) {
            data['thumbnail'] = userData.thumbnail;
            data['username'] = userData.username;
          }

          var pushToken = Storage.getPushToken();
          if (pushToken) {
            data['push_token'] = pushToken;
          }
        }
        // Or if we're testing outside of Kik, use dummy data
        else {
          data = {
            answer: 'test_answer',
            push_token: 'test_push_token',
            question: 0,
            thumbnail: 'test_thumbnail',
            username: 'test_username'
          };
        }

        // POST data to the server
        $.post(
          AppRouter.apiGetUserUrl(),
          data,
          function(data, textStatus, jqXHR) {
            console.dir(data);
            console.log(textStatus);
            console.dir(jqXHR);
          }
        );
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
        if (cards.kik !== undefined) {
          var question = AppRouter.getQuestionNum();

          cards.kik.send({
            'title': 'DS Kik Card Test',
            'text': AppRouter.getQuestionText(question) || 'More mobile team, please',
            'data': {question: question},
          });
        }
      },

    });

    return ResultsView;
  }
);
