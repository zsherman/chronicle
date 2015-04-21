
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

  Subscription.load(id, function (err, subscription) {
    if (err) return next(err);
    if (!subscription) return next(new Error('not found'));
    req.subscription = subscription;
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
  // If feed doesn't exist, create it and subscribe
  console.log(req.body);

  if(req.body.url) {
    var url = 'http://reddit.com' + req.body.url;
    Feed.findOne({source: url}, function(err, doc) {
      if(!doc) {
        var feed = new Feed({source: url});
        feed.save(function(err, feedDoc) {
          if(err) res.json(err);
          var subscription = new Subscription({
            user: req.user,
            feed: feedDoc
          });
          subscription.save(function(err, sub) {
            res.json(sub);
          });
        })
      } else {
        Subscription.findOne({user: req.user, feed: doc}, function (err, sub) {
          if(!sub) {
            var subscription = new Subscription({
               user: req.user,
               feed: doc
             });
             subscription.save(function(err, newSub) {
               res.json(newSub);
             });
          } else {
            res.json(sub);
          }
        });
      }
    });
  } else {
    var newSubscription = new Subscription(req.body);
    newSubscription.user = req.user;
    Subscription.findOne({user: req.user, feed: req.body.feed}, function (err, doc) {
      if (!doc) {
        newSubscription.save(function(err) {
            if(err) res.json(err);
            res.json(newSubscription);
          });
      } else {
        doc.remove(function(err) {
          if(err) res.json(err);
          res.json(doc);
        });
      }
    });
  }
};

exports.unsubscribe = function(req, res) {
  console.log("unsub");
}

/**
 * Edit an article
 */

exports.edit = function (req, res) {

};

/**
 * Update article
 */

exports.update = function (req, res){
  console.log(req.body);
};

/**
 * Show
 */

exports.show = function (req, res){
  console.log(req);
  res.render('subscriptions/show', {
    title: "Subscription",
    subscription: req.subscription
  });
};

/**
 * Delete an article
 */

exports.destroy = function (req, res){
  var feed = req.feed;
  console.log(feed);
  subscription.remove(function (err){
    req.flash('info', 'Deleted successfully');
    res.redirect('/feeds');
  });
  // console.log(req.body);
  // Subscription.findOneAndRemove({user: req.user, subscription: req.param('id')}, function(err, doc) {
  //   res.json(doc);
  // });
};
