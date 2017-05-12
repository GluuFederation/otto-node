var mongoose = require('mongoose');
var deepPopulate = require('mongoose-deep-populate')(mongoose);
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
    type: String
  }],
  badgeSupported: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge'
  }]
}, {
  timestamps: true
});

participantSchema.plugin(deepPopulate, {
  whitelist: [
    'memberOf',
    'memberOf.registeredBy',
    'memberOf.sponsor',
    'memberOf.federates',
    'memberOf.member',
    'memberOf.badgeSupported',
    'memberOf.supports',
    'memberOf.metadata',
    'operates',
    'operates.registeredBy',
    'operates.federatedBy',
    'operates.supports',
    'registeredBy',
    'badgeSupported'
  ], populate: {
    'memberOf' :{
      select : '-_id -__v -updatedAt -createdAt'
    },
    'memberOf.registeredBy' :{
      select : {'@id': 1, _id: 0}
    },
    'memberOf.sponsor' :{
      select : {'@id': 1, _id: 0}
    },
    'memberOf.federates' :{
      select : {'@id': 1, _id: 0}
    },
    'memberOf.member' :{
      select : {'@id': 1, _id: 0}
    },
    'memberOf.badgeSupported' :{
      select : {'@id': 1, _id: 0}
    },
    'memberOf.supports' :{
      select : {'@id': 1, _id: 0}
    },
    'memberOf.metadata' :{
      select : {'@id': 1, _id: 0}
    },
    'operates' :{
      select : '-_id -__v -updatedAt -createdAt'
    },
    'operates.registeredBy' :{
      select : {'@id': 1, _id: 0}
    },
    'operates.federatedBy' :{
      select : {'@id': 1, _id: 0}
    },
    'operates.supports' :{
      select : {'@id': 1, _id: 0}
    },
    'registeredBy' :{
      select : {'@id': 1, _id: 0}
    },
    'badgeSupported' :{
      select : '-_id -__v -updatedAt -createdAt'
    }
  }
});

participantSchema.pre('save', function (next, done) {
  this['@id'] = settings.baseURL + settings.participant + '/' + this._id;
  this['@context'] = settings.contextSchema + settings.contextParticipant;
  next();
});

module.exports = mongoose.model('Participant', participantSchema);


