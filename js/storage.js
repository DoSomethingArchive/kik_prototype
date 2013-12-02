define(function() {
  return {
    keyBase: '_ds_kik_',

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
  };
});
