var mongoose = require('mongoose');
var settings = require("../settings");
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

const FederationSchema = mongoose.Schema({
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
  sponsor: [{
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

FederationSchema.plugin(deepPopulate, {
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
FederationSchema.pre("save", function (next, done) {

  this['@id'] = settings.baseURL + settings.federations + "/" + this._id;
  this['@context'] = settings.contextSchema + settings.contextFederation;
  next();

});

var Federation = mongoose.model('Federation', FederationSchema);
module.exports = Federation;
