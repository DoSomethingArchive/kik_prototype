define(
  [
    'jquery',
    'underscore',
    'backbone',
    'storage',
    'text!templates/results.html'
  ],

  function($, _, Backbone, Storage, template) {
    var ResultsView = Backbone.View.extend({
      events: {
        'click .nextQuestion': 'nextQuestion',
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

        this.answer = data.answer;
        this.questionNum = questionNum;

        this.$el.empty();
        this.$el.append(_.template(template,data));

        // @todo Submit results to server
        // this.submitResults(set, answers);
      },

      /**
       * Go to the next question.
       */
      nextQuestion: function() {
        AppRouter.goToNextQuestion();
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

      /**
       * Submit results to server.
       */
      submitResults: function(set, answers) {
        // Convert answer indexes from string to int
        for (var i = 0; i < answers.length; i++) {
          answers[i] = parseInt(answers[i], 10);
        }

        var objAnswers = {};
        objAnswers[set] = answers;
        var strAnswers = JSON.stringify(objAnswers);
        var push_token = '',
            thumbnail = '',
            username = '';

        // Step 3: Get the push token and submit results to the server
        var onGetPushToken = function(token) {
          if (!token)
            return;

          push_token = token;

          // Submit data to the server
          var userData = {
            answers: strAnswers,
            push_token: push_token,
            thumbnail: thumbnail,
            username: username
          };

          this.execSubmit(userData);
        };

        // Step 2: get the user profile data for username and thumbnail
        var onGetUserData = function(user) {
          if (!user)
            return;

          username = user.username;
          thumbnail = user.thumbnail;

          if (cards.push && cards.push.getToken) {
            cards.push.getToken(onGetPushToken);
          }
        };

        // Step 1: Get user data
        if (cards.kik && cards.kik.getUser) {
          cards.kik.getUser(onGetUserData);
        }
        // Otherwise, if we're testing this outside of Kik, send dummy data
        else {
          var dummyData = {
            answers: JSON.stringify({'test':[1,2,3]}),
            push_token: 'test_push_token',
            thumbnail: 'test_thumbnail',
            username: 'test_username'
          };

          this.execSubmit(dummyData);
        }
      },

      /**
       * Execute the post command to submit user data
       */
      execSubmit: function(userData) {
        $.post(
          AppRouter.apiGetUserUrl(),
          userData,
          function(data, textStatus, jqXHR) {
            console.dir(data);
            console.log(textStatus);
            console.dir(jqXHR);
          }
        );
      }
    });

    return ResultsView;
  }
);
