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
        return [];
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
        return {};
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
     * Get user's answers from a question set.
     * @param int set
     *   Question set to get user's answers for.
     * @return object
     */
    getResults: function(set) {
      var key = this.keyBase + set;
      var storedJson = localStorage.getItem(key);
      var data = JSON.parse(storedJson);

      return data ? data.answers : {};
    },

    /**
     * Save the user's answer for a given question.
     * @param int set
     *   Question set.
     * @param int question
     *   Question number in the set.
     * @param int answer
     *   Answer index.
     */
    setQuestionResult: function(set, question, answer) {
      var key = this.keyBase + set;
      var storedJson = localStorage.getItem(key);
      var data = {};

      if (storedJson) {
        data = JSON.parse(storedJson);
      }
      else {
        data.key = key;
      }

      if (typeof(data.answers) == 'undefined') {
        data.answers = [];
      }

      data.answers[question] = answer;

      // Convert back to JSON string
      var newJson = JSON.stringify(data);
      localStorage.setItem(key, newJson);
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
