var request = require('request');
var bunyan = require('bunyan');
var config = require('config');
var mongoose = require('mongoose');
var async = require('async');
var _ = require('lodash');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Types.ObjectId;
var swig  = require('swig');
var path = require('path')

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
    Subscription.find({user: ObjectId(user._id)}, function(err, subscriptions) {
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
      var date = new Date();
      date.setDate(date.getDate()-1);
      Article.find({feed: ObjectId(sub.feed), createdAt: {$gte: date}}, function(err, articles) {
        // Sort them by score
        console.log(articles);
        articles = _.sortBy(articles, function(article) {
          return article.score;
        });
        // Trim down to specified quantity
        articles = articles.slice(0, sub.quantity-1);

        // Create list elements for each article
        _.each(articles, function(article) {
          subscription.substitutions.push(
            {
              articles: {title: article.title, link: article.link},
              feedName: article.feedSource
            }
          )
        });
        // Add to substititions
        //subscription.substitutions.push(articles);
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

function sendEmails(subscriptions, cb) {
    var email, success, html, feeds, articles;
    // Grab the user from the subscription hash
    async.each(subscriptions, function(subscription, callback) {
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

        // {markup: '<div></div>', feedSource: 'reddit.com/r/funny'}
        //console.log(subscription.substitutions);
        feeds = _.chain(subscription.substitutions)
            .groupBy("feedName")
            .pairs()
            .map(function(sub) {
                return _.object(_.zip(["feedName", "articles"], sub));
            })
            .value();

        // Build email template
        html = swig.renderFile(__dirname + '/template.html', {
          feeds: feeds
        });

        // subscription.substitutions.join("\n")
        email.setHtml(html);

        // Set Template
        // email.addFilter('templates', 'enable', 1);
        // email.addFilter('templates', 'template_id', '08715756-7bbc-4d51-add2-c655bf3e1d04');

        // Fill in email template
        //email.setSubstitutions({articles: subscription.substitutions.join("\n")});

        // sendgrid.send(email, function(err, json) {
        //   if (err) { console.error(err); }
        //   // Alert Dead Man's Snitch
        //   request.get('https://nosnch.in/81ff490627');
        //   console.log(json);
        //   callback();
        // });
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
