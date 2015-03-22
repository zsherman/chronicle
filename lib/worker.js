var request = require('request');
var bunyan = require('bunyan');
var rereddit = require('rereddit');

// Run with node lib/worker.js | ./node_modules/bunyan/bin/bunyan

var log = bunyan.createLogger({name: "chronicle-worker"});

rereddit.read('funny').limit(25)
    .end(function(err, posts) {
        log.info(posts);
    });

