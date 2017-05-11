var mongoose = require('mongoose');
var settings = require("../settings");
var deepPopulate = require('mongoose-deep-populate')(mongoose);

const federationSchema = mongoose.Schema({
  '@context': {
    type: String
  },
  '@id': {
    type: String
  },
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String
  },
  url: {
    type: String
  },
  metadata: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Metadata'
  }],
  supports: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schema'
  }],
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RegistrationAuthority'
  },
  member: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant'
  }],
  federates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entity'
  }],
  sponsor: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant'
  }],
  technicalContact: [{
    type: mongoose.Schema.Types.Mixed
  }],
  executiveContact: [{
    type: mongoose.Schema.Types.Mixed
  }],
  securityContact: [{
    type: mongoose.Schema.Types.Mixed
  }],
  dataProtectionCodeOfConduct: {
    type: String
  },
  federationAgreement: {
    type: String
  },
  federationPolicy: {
    type: String
  },
  trustMarkDefinitionSupported: [{
    type: String
  }],
  badgeSupported: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge'
  }]
}, {
  timestamps: true
});

federationSchema.pre('save', preSave);

function preSave(next, done) {
  this['@id'] = settings.baseURL + settings.federations + '/' + this._id;
  this['@context'] = settings.contextSchema + settings.contextFederation;
  next();
}

module.exports = mongoose.model('Federation', federationSchema);
