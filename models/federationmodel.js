var mongoose = require('mongoose');
var settings = require("../settings");
var Schema = mongoose.Schema;
var deepPopulate = require('mongoose-deep-populate')(mongoose);

var FederationSchema = new Schema({
  '@context':String,
  '@id':String,
  name: String,
  keys: [{ 
      privatekey: String,
      publickey: String,
      keyguid:String,
      alg:String
  }],
  entities :[{type :Schema.ObjectId, ref: 'Federation_Entity'}],
  organizationId : {type :Schema.ObjectId,ref:'Organization'},
  participants :[{type :Schema.ObjectId, ref: 'Organization'}] // organizations as participants
},{strict:false});

FederationSchema.plugin(deepPopulate,{ whitelist: [
    'entities',
    'organizationId',
    'entities.organizationId',
    'participants'
  ], populate: {
    'entities.organizationId': {
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
