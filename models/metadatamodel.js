var mongoose = require('mongoose');
var settings = require('../settings');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

// define the schema for meta data
const metadataSchema = mongoose.Schema({
  '@id': {
    type: String
  },
  '@context': {
    type: String
  },
  metadataFormat: {
    type: String
  },
  expiration: {
    type: Date
  }
}, {
  timestamps: true
});

metadataSchema.pre('save', function (next, done) {
  this['@id'] = settings.baseURL + settings.metadata + '/' + this._id;
  this['@context'] = settings.contextSchema + settings.contextMetadata;
  next();
});

module.exports = mongoose.model('Metadata', metadataSchema);