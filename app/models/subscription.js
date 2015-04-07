
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

var SubscriptionSchema = new Schema({
  user : {type : Schema.ObjectId, ref : 'User'},
  feed : {type : Schema.ObjectId, ref : 'Feed'},
  frequency : {type : Number, default : 168}, // In hours
  quantity : {type : Number, default : 5},
  day : { type: String, default: '' },
  active: {type: Boolean, default: true},
  sentAt : {type : Date, default : Date.now},
  createdAt : {type : Date, default : Date.now}
});

/**
 * Validations
 */

SubscriptionSchema.path('user').required(true, 'Subscription user cannot be blank');
SubscriptionSchema.path('user').required(true, 'Subscription feed cannot be blank');

/**
 * Pre-remove hook
 */

SubscriptionSchema.pre('remove', function (next) {
  // If other users are subscribed to this Subscription, don't delete it
  console.log("yo");
  next();
});

SubscriptionSchema.pre('save', function(next) {
  next();
})

/**
 * Methods
 */

SubscriptionSchema.methods = {

}

/**
 * Statics
 */

SubscriptionSchema.statics = {

  /**
   * Find article by id
   *
   * @param {ObjectId} id
   * @param {Function} cb
   * @api private
   */

  load: function (id, cb) {
    this.findOne({ _id : id })
      .populate('user', 'name email username')
      .exec(cb);
  },

  /**
   * List Subscriptions
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

mongoose.model('Subscription', SubscriptionSchema);
