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

        this.answerUsername = data.answerUsername;
        this.questionNum = questionNum;

        this.$el.empty();
        this.$el.append(_.template(template,data));

        // Submit results to server
        this.postAnswer(questionNum, data.answerUsername);
      },

      /**
       * Go to the next question.
       */
      nextQuestion: function() {
        AppRouter.goToNextQuestion();
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

    });

    return ResultsView;
  }
);
