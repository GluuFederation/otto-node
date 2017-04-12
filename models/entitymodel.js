var mongoose = require('mongoose');
var settings = require('../settings');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

// define the schema for openid connect provider
const entitySchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  url: {
    type: String
  },
  description: {
    type: String
  },
  registeredBy: {
    type: String
  },
  federatedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Federation'
  }],
  entityId: {
    type: String
  },
  entityIdUrl: {
    type: String
  },
  isApproved: {
    type: Boolean,
    required: false
  },
  '@context': {
    type: String
  },
  '@id': {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
}, {
  strict: false
});

entitySchema.pre('save', function (next, done) {
  this['@id'] = settings.baseURL + settings.entity + '/' + this._id;
  this['@context'] = settings.contextSchema + settings.contextOpenIdProvider;
  next();
});

entitySchema.plugin(deepPopulate, {
  whitelist: [
    'organization'
  ]
});

module.exports = mongoose.model('Entity', entitySchema);