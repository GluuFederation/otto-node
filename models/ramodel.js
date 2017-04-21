var mongoose = require('mongoose');
var settings = require('../settings');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

// define the schema for registration authority
const registrationAuthoritySchema = mongoose.Schema({
  '@id': {
    type: String
  },
  '@context': {
    type: String
  },
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
  federation_endpoint: {
    type: String
  },
  participant_endpoint: {
    type: String
  },
  entity_endpoint: {
    type: String
  },
  registers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Federation'
  }]
}, {
  timestamps: true
});

registrationAuthoritySchema.pre('save', function (next, done) {
  this['@id'] = settings.baseURL + settings.registrationAuthority + '/' + this._id;
  this['@context'] = settings.contextSchema + settings.contextRegistrationAuthority;
  next();
});

module.exports = mongoose.model('RegistrationAuthority', registrationAuthoritySchema);