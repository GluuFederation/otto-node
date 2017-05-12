var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
var settings = require('../settings');

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

federationSchema.plugin(deepPopulate, {
  whitelist: [
    'sponsor',
    'sponsor.registeredBy',
    'sponsor.memberOf',
    'sponsor.operates',
    'sponsor.badgeSupported',
    'federates',
    'federates.metadata',
    'federates.registeredBy',
    'federates.federatedBy',
    'federates.supports',
    'member',
    'member.registeredBy',
    'member.badgeSupported',
    'member.memberOf',
    'registeredBy',
    'supports',
    'metadata',
    'badgeSupported'
  ],
  populate: {
    'sponsor' :{
      select : '-_id -__v -updatedAt -createdAt'
    },
    'sponsor.registeredBy' :{
      select : {'@id': 1, _id: 0}
    },
    'sponsor.badgeSupported' :{
      select : {'@id': 1, _id: 0}
    },
    'sponsor.memberOf' :{
      select : {'@id': 1, _id: 0}
    },
    'sponsor.operates' :{
      select : {'@id': 1, _id: 0}
    },
    'federates' :{
      select : '-_id -__v -updatedAt -createdAt'
    },
    'federates.metadata' :{
      select : {'@id': 1, _id: 0}
    },
    'federates.registeredBy' :{
      select : {'@id': 1, _id: 0}
    },
    'federates.federatedBy' :{
      select : {'@id': 1, _id: 0}
    },
    'federates.supports' :{
      select : {'@id': 1, _id: 0}
    },
    'member' :{
      select : '-_id -__v -updatedAt -createdAt'
    },
    'member.registeredBy' :{
      select : {'@id': 1, _id: 0}
    },
    'member.badgeSupported' :{
      select : {'@id': 1, _id: 0}
    },
    'member.memberOf' :{
      select : {'@id': 1, _id: 0}
    },
    'supports' :{
      select : '-_id -__v -updatedAt -createdAt -supportedBy'
    },
    'metadata' :{
      select : '-_id -__v -updatedAt -createdAt'
    },
    'badgeSupported' :{
      select : '-_id -__v -updatedAt -createdAt'
    }
  }
});

federationSchema.pre('save', preSave);

function preSave(next, done) {
  this['@id'] = settings.baseURL + settings.federations + '/' + this._id;
  this['@context'] = settings.contextSchema + settings.contextFederation;
  next();
}

module.exports = mongoose.model('Federation', federationSchema);
