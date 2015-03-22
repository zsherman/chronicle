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

// Connect to Mandrill
// var mandrill = require('mandrill-api/mandrill');
// var mandrill_client = new mandrill.Mandrill('NJPqZ5v3RGBraIyTy_vQ_g');

// Connect to SendGrid
var sendgrid  = require('sendgrid')('chronicle-app', 'no11pfds');

// Run with node lib/worker.js | ./node_modules/bunyan/bin/bunyan

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
  text    : 'Derpy Pug Plays Fetch </br> Grumpy Cat Goes to Work'
}

sendgrid.send(payload, function(err, json) {
  if (err) { console.error(err); }
  console.log(json);
});


// rereddit.read('funny').limit(5)
//     .end(function(err, posts) {
//         log.info(posts);
//     });




// var template_name = "Digest";
// var template_content = [
//     {
//         "name": "email",
//         "content": "sonny.byrd@gmail.com"
//     },
//     {
//         "name": "articles",
//         "content": [{title: 'Derpy Pug Plays Fetch'}, {title: 'Grumpy Cat Goes to Work'}]
//     }
// ];
// var message = {
//     "html": "<p>Example HTML content</p>",
//     "text": "Example text content",
//     "subject": "example subject",
//     "from_email": "message.from_email@example.com",
//     "from_name": "Example Name",
//     "to": [{
//             "email": "recipient.email@example.com",
//             "name": "Recipient Name",
//             "type": "to"
//         }],
//     "headers": {
//         "Reply-To": "message.reply@example.com"
//     },
//     "important": false,
//     "track_opens": null,
//     "track_clicks": null,
//     "auto_text": null,
//     "auto_html": null,
//     "inline_css": null,
//     "url_strip_qs": null,
//     "preserve_recipients": null,
//     "view_content_link": null,
//     "bcc_address": "message.bcc_address@example.com",
//     "tracking_domain": null,
//     "signing_domain": null,
//     "return_path_domain": null,
//     "merge": true,
//     "merge_language": "mailchimp",
//     "global_merge_vars": [{
//             "name": "merge1",
//             "content": "merge1 content"
//         }],
//     "merge_vars": [{
//             "rcpt": "recipient.email@example.com",
//             "vars": [{
//                     "name": "merge2",
//                     "content": "merge2 content"
//                 }]
//         }],
//     "tags": [
//         "password-resets"
//     ],
//     "subaccount": "customer-123",
//     "google_analytics_domains": [
//         "example.com"
//     ],
//     "google_analytics_campaign": "message.from_email@example.com",
//     "metadata": {
//         "website": "www.example.com"
//     },
//     "recipient_metadata": [{
//             "rcpt": "recipient.email@example.com",
//             "values": {
//                 "user_id": 123456
//             }
//         }],
//     "attachments": [{
//             "type": "text/plain",
//             "name": "myfile.txt",
//             "content": "ZXhhbXBsZSBmaWxl"
//         }],
//     "images": [{
//             "type": "image/png",
//             "name": "IMAGECID",
//             "content": "ZXhhbXBsZSBmaWxl"
//         }]
// };
// var async = false;
// var ip_pool = "Main Pool";
// var send_at = new Date(Date.now()).toISOString();
// mandrill_client.messages.sendTemplate({"template_name": template_name, "template_content": template_content, "message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at}, function(result) {
//     console.log(result);
// }, function(e) {
//     // Mandrill returns the error as an object with name and message keys
//     console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
//     // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
// });

