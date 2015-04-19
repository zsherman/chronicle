var request = require('request');
var bunyan = require('bunyan');
var config = require('config');
var mongoose = require('mongoose');
var xray = require('x-ray');
var _ = require('lodash');
var async = require('async');

// Connect to mongodb
var connect = function () {
  var options = { server: { socketOptions: { keepAlive: 1 } } };
  mongoose.connect(config.db, options);
};
connect();

mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);

mongoose.connection.on('error', function(err) {
  console.log(err);
});

// Get subscription model
var mongooseSubscription = require('../app/models/subscription');
var Subscription = mongoose.model('Subscription');

// Get article model
var mongooseArticle = require('../app/models/article');
var Article = mongoose.model('Article');

// Get feed model
var mongooseFeed = require('../app/models/feed');
var Feed = mongoose.model('Feed');

// Article Schema
// title: {type : String, default : '', trim : true},
// feed: {type : Schema.ObjectId, ref : 'Feed'},
// score: {type : Number, default : 1 },
// tags: {type: [], get: getTags, set: setTags},
// image: {type : String, default : '', trim : true},
// createdAt  : {type : Date, default : Date.now}

// Set up bunyan logger
var log = bunyan.createLogger({name: "chronicle-emailer"});

// Article.list({}, function(err, articles) {
//   log.info(articles);
// });
// var new_article = new Article({title: "This is a test", link: "link.com"});
// new_article.save();

// If speed becomes an issue it may be worth looking into
// https://github.com/rc0x03/node-osmosis

// Run with node bin/scraper.js | ./node_modules/bunyan/bin/bunyan

// Get list of feeds
  // Scrape each feed source
    // Find or create article for each feed
    // Save the article
// Finish up

function scrapeSources(feeds, cb) {
  var articles = [];
  async.each(feeds, function(feed, callback) {
    xray(feed.source)
    .select([{
      $root: ".thing",
      title: '.entry a.title',
      link: '.entry a.title[href]',
      image: 'a.thumbnail img[src]',
      score: '.score.unvoted'
    }])
    .run(function(err, elements) {
      elements = elements.map(function(el) {
        return _.merge(el, {feed: feed._id, feedSource: feed.source});
      });
      Array.prototype.push.apply(articles, elements);
      callback();
    })
  }, function(err) {
    cb(err, articles);
  });
}

function findOrCreateArticles(articles, cb) {
  var newArticles = [];
  async.each(articles, function(article, callback) {
    var score = parseInt(article.score) || 0;
    Article.findOne({link: article.link}, function (err, doc) {
      if (!doc) {
        var newArticle = new Article({
          title: article.title,
          link: article.link,
          feed: article.feed,
          feedSource: article.feedSource,
          score: score
        });
        newArticle.save(function(error, newArticle) {
          newArticles.push(newArticle);
          callback();
        });
      } else {
        doc.score = score;
        doc.updatedAt = new Date().toJSON().toString();
        doc.save(function(error, doc) {
          newArticles.push(doc);
          callback();
        });
      }
    });
  }, function(err) {
    console.log("Created " + newArticles.length + " articles");
    cb(err, newArticles);
  });
}

async.waterfall([
  function(cb) {
    // Get all feeds
    Feed.find({}, cb)
  },
  function(feeds, cb) {
    // Scrape all feed sources
    scrapeSources(feeds, cb)
  },
  function(articles, cb) {
    // Find or create each article
    findOrCreateArticles(articles, cb)
  }
], function(err) {
  if (err) process.exit(1);
  else {
    //Alert Dead Man's Snitch
    request.get('https://nosnch.in/81ff490627', function() {
      process.exit(0);
    });
  }
});


// Example using reddit api
// https://www.reddit.com/r/rust/top/.json?sort=top&t=day
// rereddit.read('funny').limit(5)
//     .end(function(err, posts) {
//         log.info(posts);
//     });
