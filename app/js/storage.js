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
      if (jsonUsers)
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
      if (jsonUser)
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
    },

    /**
     * Clear any previously existing friend answers.
     */
    clearFriendResults: function() {
      for (var keyIndex = 0; keyIndex < localStorage.length; keyIndex++) {
        keyName = localStorage.key(keyIndex);
        if (keyName.substring(0,8) == this.keyBase && keyName.substr(-7) == '_friend') {
          console.log('Clearing from localStorage: ' + keyName);
          localStorage.removeItem(keyName);
        }
      }
    },

    /**
     * Get friend's answers.
     */
    getFriendResults: function(set) {
      var key = this.keyBase + set + '_friend';
      var data = localStorage.getItem(key);
      data = data ? JSON.parse(data) : [];

      console.log("\n\nfriend results: [" + key + "] " + JSON.stringify(data));

      return data;
    },

    /**
     * Save friend results for a given set of questions.
     *
     * @param int set
     *   Question set.
     * @param JSONified array answers
     *   Answers to the question set.
     */
    setFriendResults: function(set, answers) {
      var key = this.keyBase + set + '_friend';
      var jsonAnswers = JSON.stringify(answers);
      localStorage.setItem(key, jsonAnswers);
    }
  };
});
