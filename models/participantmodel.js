var mongoose = require('mongoose');
var settings = require("../settings");

// define the schema for our participant
const participantSchema = mongoose.Schema({
  '@id': {
    type: String
  },
  '@context': {
    type: String
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  url: {
    type: String
  },
  description: {
    type: String
  },
  memberOf: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Federation'
  }],
  operates: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entity'
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RegistrationAuthority'
  },
  technicalContact: [{
    type: mongoose.Schema.Types.Mixed
  }],
  executiveContact: [{
    type: mongoose.Schema.Types.Mixed
  }],
  securityContact: [{
    type: mongoose.Schema.Types.Mixed
  }],
  trustMarkFile: {
    type: String
  },
  trustMarkAsserted: [{
    type: mongoose.Schema.Types.Mixed
  }],
  badgeSupported: [{
    type: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

participantSchema.pre('save', function (next, done) {
  this['@id'] = settings.baseURL + settings.participant + '/' + this._id;
  this['@context'] = settings.contextSchema + settings.contextParticipant;
  next();
});

module.exports = mongoose.model('Participant', participantSchema);


