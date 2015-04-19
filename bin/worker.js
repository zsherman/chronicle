var request = require('request');
var bunyan = require('bunyan');
var config = require('config');
var mongoose = require('mongoose');
var async = require('async');
var _ = require('lodash');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;

// Connect to mongodb
var connect = function () {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  mongoose.connect(config.db, options);
};
connect();

mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);

// Get subscription model
var mongooseSubscription = require('../app/models/subscription');
var Subscription = mongoose.model('Subscription');

var mongooseUser = require('../app/models/user');
var User = mongoose.model('User');

var mongooseArticle = require('../app/models/article');
var Article = mongoose.model('Article');

// Connect to SendGrid
var sendgrid  = require('sendgrid')('chronicle-app', 'no11pfds');

// Run with node bin/worker.js | ./node_modules/bunyan/bin/bunyan
// or on heroku with http://stackoverflow.com/questions/13345664/using-heroku-scheduler-with-node-js

var log = bunyan.createLogger({name: "chronicle-worker"});

function findSubscriptions(users, cb) {
  var subs = [];
  async.each(users, function(user, callback) {
    console.log(user);
    Subscription.find({user: ObjectId(user._id)}, function(err, subscriptions) {
      console.log(subscriptions);
      Array.prototype.push.apply(subs, subscriptions);
      callback();
    });
  }, function(err) {
    cb(err, subs);
  });
}

function buildEmails(subscriptions, cb) {

  async.each(subscriptions, function(subscription, callback) {
    subscription.substitutions = [];
    async.each(subscription.subscriptions, function(sub, callback2) {
      Article.find({feed: ObjectId(sub.feed)}, function(err, articles) {
        // Sort them by score
        //console.log(articles);
        articles = _.sortBy(articles, function(article) {
          return article.score;
        });
        // Trim down to specified quantity
        articles = articles.slice(0, sub.quantity-1);

        // Create list elements for each article
        articles = articles.map(function(article) {
          return '<li><a href="' + article.link + '">' + article.title + '</a></li>'
        });
        // Add to substititions
        Array.prototype.push.apply(subscription.substitutions, articles);
        // Execute callback
        callback2();
      });
    }, function(err) {
      callback();
    });
  }, function(err) {
    //console.log(subscriptions)
    cb(err, subscriptions);
  });
}


function sendEmail(subscriptions, cb) {

  async.each(subscriptions, function(subscription, callback) {
    var payload,
        email,
        user,
        substitutions = [];
    // Loop through subscriptions within hash
    async.each(subscription.subscriptions, function(sub, callback2) {
      // Find all articles associated with the subscription's feed
      Article.find({feed: sub.feed}, function(articles) {
        // Sort them by score
        //console.log(articles);
        articles = _.sortBy(articles, function(article) {
          return article.score;
        });
        // Trim down to specified quantity
        articles = articles.slice(0, sub.quantity-1);

        // Create list elements for each article
        articles = articles.map(function(article) {
          return '<li><a href="' + article.link + '">' + article.title + '</a></li>'
        });
        // Add to substititions
        Array.prototype.push.apply(substitutions, articles);
        // Execute callback
        callback2();
      }, function(err) {
        callback();
      });
    });

    // Grab the user from the subscription hash
    user = User.findById(subscription.user);
    // Define payload
    payload   = {
      to      : user.email,
      from    : 'zach@chronicle.io',
      subject : 'Your Digest',
      text    : 'Here is your digest:'
    }
    // Email settings
    email = new sendgrid.Email(payload);
    email.addFilter('templates', 'enable', 1);
    email.addFilter('templates', 'template_id', '08715756-7bbc-4d51-add2-c655bf3e1d04');

    // Fill in email template
    email.setSubstitutions({articles: substitutions.toString()});

    sendgrid.send(email, function(err, json) {
      if (err) { console.error(err); }
      // Alert Dead Man's Snitch
      success = true;
      request.get('https://nosnch.in/81ff490627');
      console.log(json);
      callback();
    });
  }, function(err){
    cb(err, success)
  });

}

function sendEmails(subscriptions, cb) {
    var email, success;
    // Grab the user from the subscription hash
    async.each(subscriptions, function(subscription, callback) {
      //var user = User.findById(subscription.user);
      console.log(subscription);
      User.findOne({_id: subscription.user}, function (err, user) {
        // Define payload
        payload   = {
          to      : user.email,
          from    : 'zach@chronicle.io',
          subject : 'Your Digest',
          text    : 'Here is your digest:'
        }

        // Email settings
        email = new sendgrid.Email(payload);
        email.setHtml(subscription.substitutions.join("\n"));
        // email.addFilter('templates', 'enable', 1);
        // email.addFilter('templates', 'template_id', '08715756-7bbc-4d51-add2-c655bf3e1d04');

        // Fill in email template
        //email.setSubstitutions({articles: subscription.substitutions.join("\n")});

        sendgrid.send(email, function(err, json) {
          if (err) { console.error(err); }
          // Alert Dead Man's Snitch
          request.get('https://nosnch.in/81ff490627');
          console.log(json);
          callback();
        });
      });
    },
    function(err){
      cb(err, "success");
    });
}

async.waterfall([
  function(cb) {
    // Get all users
    User.find({}, cb);
  },
  function(users, cb) {
    // Get all subscriptions
    findSubscriptions(users, cb);
  },
  function(subscriptions, cb) {
    // Organize user subscriptions
    subscriptions = _.chain(subscriptions)
    .groupBy("user")
    .pairs()
    .map(function(sub) {
        return _.object(_.zip(["user", "subscriptions"], sub));
    })
    .value();
    // Build emails
    buildEmails(subscriptions, cb);
  },
  function(subscriptions, cb) {
    sendEmails(subscriptions, cb);
  }
], function(err) {
  // Done
  process.exit(0);
});

// // Todo: Use handlebars or swig template to send in here
// email.setSubstitutions({articles: ['<li><a href="https://reddit.com/r/funny">Girly Things</a></li><li><a href="https://reddit.com/r/funny">Buttons</a></li><li><a href="https://reddit.com/r/funny">Girly Things</a></li>']});
