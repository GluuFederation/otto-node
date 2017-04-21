var mongoose = require('mongoose');
var settings = require('../settings');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

// define the schema for meta data
const acrSchema = mongoose.Schema({
  '@id': {
    type: String
  },
  '@context': {
    type: String
  },
  name: {
    type: String
  },
  description: {
    type: String
  },
  supportedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Federation'
  }]
}, {
  timestamps: true
});

acrSchema.pre('save', function (next, done) {
  this['@id'] = settings.baseURL + settings.acr + '/' + this._id;
  this['@context'] = settings.contextOPSchema + settings.contextACR;
  next();
});

module.exports = mongoose.model('ACR', acrSchema);