
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var config = require('config');
var utils = require('../../lib/utils');

var Schema = mongoose.Schema;

/**
 * Getters
 */


/**
 * Setters
 */


/**
 * Article Schema
 */

var FeedSchema = new Schema({
  type: {type : String, default : '', trim : true},
  source: {type : String, default : '', trim : true, unique: true},
  createdAt  : {type : Date, default : Date.now}
});

/**
 * Validations
 */

FeedSchema.path('source').required(true, 'Feed source cannot be blank');

/**
 * Pre-remove hook
 */

FeedSchema.pre('remove', function (next) {
  // If other users are subscribed to this feed, don't delete it
  next();
});

FeedSchema.pre('save', function(next) {
  next();
});

FeedSchema.post('save', function(feed) {
  // Scrape the feed
});

/**
 * Methods
 */

FeedSchema.methods = {

}

/**
 * Statics
 */

FeedSchema.statics = {

  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  load: function (id, cb) {
    console.log("id");
    console.log(id);
    this.findOne({ _id : id })
      // .populate('user', 'name email username')
      .exec(cb);
  },

  /**
   * List feeds
   *
   * @param {Object} options
   * @param {Function} cb
   * @api private
   */

  list: function (options, cb) {
    var criteria = options.criteria || {}

    this.find(criteria)
      .sort({'createdAt': -1}) // sort by date
      .limit(options.perPage)
      .skip(options.perPage * options.page)
      .exec(cb);
  }
}

mongoose.model('Feed', FeedSchema);
