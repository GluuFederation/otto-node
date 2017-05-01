var mongoose = require('mongoose');
var settings = require('../settings');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

// define the schema for meta data
const schemaSchema = mongoose.Schema({
  '@id': {
    type: String
  },
  '@context': {
    type: String
  },
  name: {
    type: String
  },
  category: {
    type: String
  },
  url: {
    type: String
  },
  required: {
    type: Boolean
  },
  supportedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Federation'
  }],
  sameAs: {
    type: String
  }
}, {
  timestamps: true
});

schemaSchema.pre('save', function (next, done) {
  this['@id'] = settings.baseURL + settings.schema + '/' + this._id;
  this['@context'] = settings.contextSchema + settings.contextSchemaClass;
  next();
});

module.exports = mongoose.model('Schema', schemaSchema);