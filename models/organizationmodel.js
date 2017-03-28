var mongoose = require('mongoose');
var settings = require("../settings");
var Schema = mongoose.Schema;


// define the schema for our organization
const OrganizationSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  phoneNo: {
    type: String
  },
  address: {
    type: String
  },
  zipcode: {
    type: String
  },
  state: {
    type: String
  },
  city: {
    type: String
  },
  type: {
    type: String
  },
  description: {
    type: String
  },
  federation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Federation'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
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
  entities: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Provider'
  }],
  federations: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Federation'
  }],
  trustMark: String
}, {
  timestamps: true
}, {
  strict: false
});

OrganizationSchema.pre("save", function (next, done) {

  this['@id'] = settings.baseURL + settings.organization + "/" + this._id;
  this['@context'] = settings.contextSchema + settings.contextOrganization;
  //console.log(this);
  next();

});

var Organization = mongoose.model('Organization', OrganizationSchema);
module.exports = Organization;


