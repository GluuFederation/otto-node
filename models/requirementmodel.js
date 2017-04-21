var mongoose = require('mongoose');
var settings = require('../settings');
var deepPopulate = require('mongoose-deep-populate')(mongoose);

// define the schema for meta data
const requirementSchema = mongoose.Schema({
  '@id': {
    type: String
  },
  '@context': {
    type: String
  }
}, {
  timestamps: true
});

requirementSchema.pre('save', function (next, done) {
  this['@id'] = settings.baseURL + settings.requirement + '/' + this._id;
  this['@context'] = settings.contextSchema + settings.contextRequirement;
  next();
});

module.exports = mongoose.model('Requirement', requirementSchema);