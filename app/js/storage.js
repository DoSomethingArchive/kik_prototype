define(function() {
  return {
    keyBase: '_ds_kik_',

    /**
     * Get the list of friends selected.
     *
     * @return array
     */
    getFriendsList: function() {
      var key = this.keyBase + 'friends_list';
      var jsonUsers = localStorage.getItem(key);
      if (jsonUsers && jsonUsers != 'undefined')
        return JSON.parse(jsonUsers);
      else
        return null;
    },

    /**
     * Save the list of selected friends.
     *
     * @param array users
     */
    setFriendsList: function(users) {
      var key = this.keyBase + 'friends_list';
      var jsonUsers = JSON.stringify(users);
      localStorage.setItem(key, jsonUsers);
    },

    /**
     * Get the counter used for tracking when to show the share button.
     *
     * @return int
     */
    getShowShareCounter: function() {
      var key = this.keyBase + 'show_share_counter';
      var num = localStorage.getItem(key);
      if (num)
        return parseInt(num, 10);
      else
        return 0;
    },

    /**
     * Increments the counter for tracking when to show the share button.
     */
    incrementShowShareCounter: function() {
      var key = this.keyBase + 'show_share_counter';
      var num = localStorage.getItem(key);

      // Update current number or start at 1.
      if (num) {
        num = parseInt(num, 10);
        num++;
      }
      else {
        num = 1;
      }

      // Save to local storage
      localStorage.setItem(key, num);
    },

    /**
     * Resets the counter to 0 for tracking when to show the share button.
     */
    resetShowShareCounter: function() {
      var key = this.keyBase + 'show_share_counter';
      localStorage.setItem(key, 0);
    },

    /**
     * Get the user's Kik push token.
     *
     * @return string
     */
    getPushToken: function() {
      var key = this.keyBase + 'push_token';
      var token = localStorage.getItem(key);

      return token || null;
    },

    /**
     * Set the user's Kik push token.
     *
     * @param string token
     */
    setPushToken: function(token) {
      var key = this.keyBase + 'push_token';
      localStorage.setItem(key, token);
    },

    /**
     * Get the user data.
     *
     * @return object
     */
    getUserData: function() {
      var key = this.keyBase + 'user_data';
      var jsonUser = localStorage.getItem(key);
      if (jsonUser && jsonUser != 'undefined')
        return JSON.parse(jsonUser);
      else
        return null;
    },

    /**
     * Save the user data.
     *
     * @param object user
     */
    setUserData: function(user) {
      var key = this.keyBase + 'user_data';
      var jsonUser = JSON.stringify(user);
      localStorage.setItem(key, jsonUser);
    },

    /**
     * Get user's answers from a question.
     *
     * @param int question
     * @return string
     */
    getQuestionAnswer: function(question) {
      var key = this.keyBase + 'question_' + question;
      var username = localStorage.getItem(key);

      return username || null;
    },

    /**
     * Save the user's answer for a given question.
     *
     * @param int question
     * @param string username
     */
    setQuestionAnswer: function(question, username) {
      var key = this.keyBase + 'question_' + question;
      localStorage.setItem(key, username);

      // Also incremement the number of questions answered and save
      this.incrementShowShareCounter();
    },
  };
});
