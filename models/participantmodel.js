var mongoose = require('mongoose');
var settings = require("../settings");
var Schema = mongoose.Schema;


// define the schema for our organization
const ParticipantSchema = mongoose.Schema({
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

ParticipantSchema.pre("save", function (next, done) {

  this['@id'] = settings.baseURL + settings.organization + "/" + this._id;
  this['@context'] = settings.contextSchema + settings.contextParticipant;
  //console.log(this);
  next();

});

var Participant = mongoose.model('Participant', ParticipantSchema);
module.exports = Participant;


