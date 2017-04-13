var mongoose = require('mongoose');
var settings = require("../settings");

// define the schema for our participant
const participantSchema = mongoose.Schema({
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
  isApproved: {
    type: Boolean,
    default: false
  },
  trustMarkFile: {
    type: String
  },
  '@context': {
    type: String
  },
  '@id': {
    type: String
  },
  memberOf: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Federation'
  }],
  trustMark: String,
  operates: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entity'
  },
  registeredBy: {
    type: String
  },
  technicalContact: [{
    type: mongoose.Schema.Types.Mixed
  }],
  executiveContact: [{
    type: mongoose.Schema.Types.Mixed
  }],
  securityContact: [{
    type: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
}, {
  strict: false
});

participantSchema.pre('save', function (next, done) {
  this['@id'] = settings.baseURL + settings.participant + '/' + this._id;
  this['@context'] = settings.contextSchema + settings.contextParticipant;
  next();
});

module.exports = mongoose.model('Participant', participantSchema);


