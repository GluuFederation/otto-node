var mongoose = require('mongoose');
var settings = require("../settings");
var deepPopulate = require('mongoose-deep-populate')(mongoose);

const federationSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  url: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: false
  },
  '@context': {
    type: String
  },
  '@id': {
    type: String
  },
  federates: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entity'
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant'
  }],
  operates: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entity'
  },
  registeredBy: {
    type: String
  },
  sponsors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant'
  }],
  technicalContactPoint: [{
    type: mongoose.Schema.Types.Mixed
  }],
  executiveContactPoint: [{
    type: mongoose.Schema.Types.Mixed
  }],
  securityContactPoint: [{
    type: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
}, {
  strict: false
});

federationSchema.plugin(deepPopulate, {
  whitelist: [
    'entities',
    'organization',
    'entities.organization',
    'participants'
  ], populate: {
    'entities.organization': {
      select: 'name @id -_id'
    },
    'entities': {
      select: '-_id -__v'
    }
  }
});

federationSchema.pre('findOne', preFind);
federationSchema.pre('findById', preFind);
federationSchema.pre('save', preSave);

function preFind() {
  return this.select('-__v -_id').populate({path:'federates', select: '-__v -_id'}).populate({path:'members', select: '-__v -_id'});
}

function preSave(next, done) {
  this['@id'] = settings.baseURL + settings.federations + '/' + this._id;
  this['@context'] = settings.contextSchema + settings.contextFederation;
  next();
}

module.exports = mongoose.model('Federation', federationSchema);
