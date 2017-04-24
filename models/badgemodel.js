var mongoose = require('mongoose');
var settings = require('../settings');

// define the schema for badge
const badgeSchema = mongoose.Schema({
  type: {
    type: String
  },
  '@id': {
    type: String
  },
  name: {
    type: String
  },
  description: {
    type: String
  },
  image: {
    type: String
  },
  criteria: {
    narrative: {
      type: String
    }
  },
  issuer: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Participant'
  }]
}, {
  timestamps: true
});

badgeSchema.pre('save', function (next, done) {
  this['@id'] = settings.baseURL + settings.badge + '/' + this._id;
  this['@context'] = settings.contextBadge;
  next();
});

module.exports = mongoose.model('Badge', badgeSchema);