var reddit = require('reddit.js');

reddit.searchSubreddits("gardening").limit(5).fetch(function(res) {
  console.log(res);
});