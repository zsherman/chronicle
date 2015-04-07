var request = require('request');
var bunyan = require('bunyan');
var rereddit = require('rereddit');
var config = require('config');
var mongoose = require('mongoose');

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

// Connect to SendGrid
var sendgrid  = require('sendgrid')('chronicle-app', 'no11pfds');

// Run with node bin/worker.js | ./node_modules/bunyan/bin/bunyan
// or on heroku with http://stackoverflow.com/questions/13345664/using-heroku-scheduler-with-node-js

// User ObjectId("550daf18a4050bb275cb31f9")
// Feed ObjectId("550df667ecbeeaf9a3b28d0f")

var log = bunyan.createLogger({name: "chronicle-worker"});

Subscription.list({}, function(err, subscriptions) {
  log.info(subscriptions);
});

var articles = [
  {
    title: 'Derpy Pug Plays Fetch'
  },
  {
    title: 'Grumpy Cat Goes to Work'
  }
]

var articles = 'Derpy Pug Plays Fetch, Grumpy Cat Goes to Work';

var payload   = {
  to      : 'zksherm@gmail.com',
  from    : 'zach@chronicle.io',
  subject : 'Your Weekly Digest',
  text    : 'Here is your weekly digest:'
}

var email = new sendgrid.Email(payload);

// add filter settings one at a time
email.addFilter('templates', 'enable', 1);
email.addFilter('templates', 'template_id', '08715756-7bbc-4d51-add2-c655bf3e1d04');

// set a filter using an object literal.
email.setFilters({
    'templates': {
        'settings': {
            'enable': 1,
            'template_id' : '08715756-7bbc-4d51-add2-c655bf3e1d04',
        }
    }
});

// Todo: Use handlebars or swig template to send in here
email.setSubstitutions({articles: ['<li><a href="https://reddit.com/r/funny">Girly Things</a></li><li><a href="https://reddit.com/r/funny">Buttons</a></li><li><a href="https://reddit.com/r/funny">Girly Things</a></li>']});

sendgrid.send(email, function(err, json) {
  if (err) { console.error(err); }
  console.log(json);
});