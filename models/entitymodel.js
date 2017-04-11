var mongoose = require('mongoose');
var settings = require("../settings");
var Schema = mongoose.Schema;

var deepPopulate = require('mongoose-deep-populate')(mongoose);


// define the schema for openid connect provider
const EntitySchema = mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  url: {
    type: String
  },
  description: {
    type: String
  },
  registeredBy: {
    type: String
  },
  federatedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Federation'
  }],
  entityId: {
    type: String
  },
  entityIdUrl: {
    type: String
  },
  isApproved: {
    type: Boolean,
    required: false
  },
  '@context': {
    type: String
  },
  '@id': {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
}, {
  strict:false
});

EntitySchema.pre('save',function(next,done) {
  this['@id']=settings.baseURL + settings.entity+'/'+this._id;
  this['@context']=settings.contextSchema + settings.contextOpenIdProvider;
  next();
});

EntitySchema.plugin(deepPopulate, {
  whitelist: [
    'organization'
   ]
});

var Entity = mongoose.model('Entity', EntitySchema);
module.exports = Entity;


