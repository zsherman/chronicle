/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Article = mongoose.model('Article');

/**
 * List items tagged with a tag
 */

exports.index = function (req, res) {

};

exports.search = function(req, res) {
  res.render('pages/search', {
    title: "Search"
  });
}
