
/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
var Feed = mongoose.model('Feed');
var User = mongoose.model('User');
var Subscription = mongoose.model('Subscription')
var utils = require('../../lib/utils')
var extend = require('util')._extend

/**
 * Load
 */

exports.load = function (req, res, next, id){
  var Subscription = mongoose.model('Subscription');

  Article.load(id, function (err, article) {
    if (err) return next(err);
    if (!article) return next(new Error('not found'));
    req.article = article;
    next();
  });
};

/**
 * List
 */

exports.index = function (req, res){
  var page = (req.param('page') > 0 ? req.param('page') : 1) - 1;
  var perPage = 30;
  var options = {
    perPage: perPage,
    page: page
  };

  Subscription.list(options, function (err, subscriptions) {
    if (err) return res.render('500');
    Subscription.count().exec(function (err, count) {
      res.render('subscriptions/index', {
        title: 'Subscriptions',
        subscriptions: subscriptions,
        page: page + 1,
        pages: Math.ceil(count / perPage)
      });
    });
  });
};

/**
 * New article
 */

exports.new = function (req, res){
  res.render('subscriptions/new', {
    title: 'New Subscription',
    subscription: new Subscription({})
  });
};

/**
 * Create an article
 * Upload an image
 */

exports.create = function (req, res) {
  console.log(req.body);
  var subscription = new Subscription(req.body);
  subscription.save(function(err) {
    if(err) res.json(err);
    res.json(subscription);
  });
};

/**
 * Edit an article
 */

exports.edit = function (req, res) {

};

/**
 * Update article
 */

exports.update = function (req, res){

};

/**
 * Show
 */

exports.show = function (req, res){
  res.render('subscriptions/show', {
    title: req.article.title,
    feed: req.feed
  });
};

/**
 * Delete an article
 */

exports.destroy = function (req, res){

};
