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
  isActive: {
    type: Boolean,
    default: false
  },
  keys: [{
    privatekey: String,
    publickey: String,
    keyguid: String,
    alg: String
  }],
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
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization'
  }]
}, {
  timestamps: true
}, {
  strict:false
});

FederationSchema.plugin(deepPopulate,{ whitelist: [
    'entities',
    'organization',
    'entities.organization',
    'participants'
  ], populate: {
    'entities.organization': {
      select: 'name @id -_id'
          },
     'entities' :{
       select : '-_id -__v'
     }     
  }
});
FederationSchema.pre("save",function(next,done){
  
  this['@id']=settings.baseURL + settings.federations+"/"+this._id;
  this['@context']=settings.contextSchema + settings.contextFederation;
  next();
    
});

var Federation = mongoose.model('Federation', FederationSchema);
module.exports = Federation;
