var federationmodel = require("../models/federationmodel");
var federationentitymodel = require("../models/federation_entitymodel");
var Guid = require('guid');
var mongoose = require('mongoose');
var Federation = mongoose.model('Federation');
var FederationEntity = mongoose.model('Federation_Entity');
var Common = require('../helpers/common');
var Ajv = require('ajv');
var ajv = Ajv({
    allErrors: true
});
var keypair = require('keypair');
var pem2jwk = require('pem-jwk').pem2jwk
var settings = require("../settings");
var baseURL = settings.baseURL;
var FederationURL = settings.federations;
var ObjectId = require('mongoose').ObjectId;
var JSPath = require('jspath');
var possibleDepthArr = ['federations', 'federations.entities', 'federations.organization', 'federations.entities.organization'];

var FederationAJVSchema = {
    "properties": {

        "name": {
            "type": "string"
        },
    },
    "required": ["name"]
}

exports.getAllFederation = function(req, callback) {

    if (req.query.depth == null) {
        Federation.find({}, "_id", function(err, docs) {
            var federationsArr = Array();
            docs.forEach(function(element) {
                federationsArr.push(baseURL + FederationURL + "/" + element._id);
            });
            callback(null, federationsArr);
        });
    } else if (req.query.depth == 'federations') {
        Federation.find({}).select('-__v -_id').lean().exec(function(err, docs) {

            if (err) throw err;
            for (var i = 0; i < docs.length; i++) {

                if (docs[i].hasOwnProperty("organizationId")) {
                    docs[i]["organization"] = settings.baseURL + settings.organization + "/" + docs[i].organizationId;
                    delete docs[i].organizationId;
                }
                if (docs[i].hasOwnProperty("entities")) {
                    for (var j = 0; j < docs[i].entities.length; j++) {
                        docs[i].entities[j] = settings.baseURL + settings.federation_entity + "/" + docs[i].entities[j];
                    }
                }

            }
            callback(null, docs);
        });
    } else if (req.query.depth == 'federations.entities') {
        Federation.find({}).select('-__v -_id').populate({
            path: 'entities',
            select: '-_id -__v',
            match: {}
        }).lean().exec(function(err, docs) {
            for (var i = 0; i < docs.length; i++) {

                if (docs[i].hasOwnProperty("organizationId")) {
                    docs[i]["organization"] = settings.baseURL + settings.organization + "/" + docs[i].organizationId;
                    delete docs[i].organizationId;
                }

                for (var j = 0; j < docs[i].entities.length; j++) {

                    if (docs[i].entities[j].hasOwnProperty("organizationId")) {
                        docs[i].entities[j]["organization"] = settings.baseURL + settings.organization + "/" + docs[i].entities[j].organizationId;
                        delete docs[i].entities[j].organizationId;
                    }

                }
            }
            callback(null, docs);

        });
    } else if (req.query.depth == 'federations.entities.organization') {
        Federation.find({}).select('-__v -_id').lean().exec(function(err, docs) {
            Federation.deepPopulate(docs, 'entities.organizationId', function(err, doc) {
                var data = JSON.parse(JSON.stringify(doc));
                data.forEach(function(element) {
                    element.entities.forEach(function(ele) {
                        ele["organization"] = ele.organizationId;
                        delete ele.organizationId;
                    });
                    if (element.hasOwnProperty("organizationId")) {
                        element["organization"] = settings.baseURL + settings.organization + "/" + element.organizationId;
                        delete element.organizationId;
                    }
                });
                callback(null, data);

            });
        });
    } else if (req.query.depth == 'federations.organization') {
        Federation.find({}).select('-__v -_id').populate({
            path: 'organizationId',
            select: 'name @id -_id'
        }).lean().exec(function(err, docs) {
            for (var i = 0; i < docs.length; i++) {
                if (docs[i].hasOwnProperty("organizationId")) {
                    docs[i]["organization"] = docs[i].organizationId;
                    delete docs[i].organizationId;

                }
                if (docs[i].hasOwnProperty("entities")) {
                    for (var j = 0; j < docs[i].entities.length; j++) {
                        docs[i].entities[j] = settings.baseURL + settings.federation_entity + "/" + docs[i].entities[j];
                    }
                }
            }
            callback(null, docs);
        });
    } else {
        callback({
            "error": ['unknown value for depth parameter'],
            "code": 400
        }, null);
    }
};


exports.getAllFederationWithDepth = function(req, callback) {
    
    var pageno = +req.query.pageno;
    var pageLength = +req.query.pagelength;

    if (req.query.depth == null) {
        if(pageno == undefined)
        {
            Federation.find({}, "_id", function(err, docs) {
                var federationsArr = Array();
                docs.forEach(function(element) {
                    federationsArr.push(baseURL + FederationURL + "/" + element._id);
                });
                callback(null, federationsArr);
            });
        }
        else{

            Federation.find({}).select("_id").skip(pageno*pageLength).limit(pageLength).exec(function(err, docs) {
                if(err)
                    throw err;

                var federationsArr = Array();
                docs.forEach(function(element) {
                    federationsArr.push(baseURL + FederationURL + "/" + element._id);
                });
                callback(null, federationsArr);
            });

        }
    } else {

        var depthArr = Array();
        depthArr = depthArr.concat(req.query.depth);

         for(var i=0;i<depthArr.length;i++)
         {
            if(!(possibleDepthArr.indexOf(depthArr[i]) >-1))
            {
                callback({ "error" :["Invalid value ("+depthArr[i]+") for depth param"],"code" : 400},null);
            }
         }

        function callbackgetFederaions(err,docs,depthArr){
            Federation.deepPopulate(docs, 'entities.organizationId', function(err, doc) {
                var data = JSON.parse(JSON.stringify(doc));
                var isFedOrgDepth = false,
                    isFedEntityDepth = false,
                    isFedEntOrg = false;

                if (depthArr.indexOf("federations.organization") > -1)
                    isFedOrgDepth = true;

                if (depthArr.indexOf("federations.entities") > -1)
                    isFedEntityDepth = true;

                if (depthArr.indexOf("federations.entities.organization") > -1) {
                    isFedEntOrg = true;
                    isFedEntityDepth = true;
                }

                data.forEach(function(ele) {

                    if (ele.hasOwnProperty("organizationId")) {
                        ele["organization"] = ele.organizationId;
                        delete ele.organizationId;
                        if (!isFedOrgDepth) {
                            if(ele["organization"]!=undefined)
                                ele["organization"] = ele["organization"]["@id"];
                        }
                    }
                    if (!isFedEntityDepth) {
                        var temp = Array();
                        for(var i=0;i<ele.entities.length;i++)
                        {
                                temp.push(ele.entities[i]["@id"]);
                        }
                        // ele.entities.forEach(function(eleEnt) {
                        //     //eleEnt = eleEnt["@id"];
                            
                        // });
                        ele["entities"]=temp;
                    } else {
                        ele.entities.forEach(function(eleEnt) {
                            eleEnt["organization"] = eleEnt.organizationId;
                            delete eleEnt.organizationId;
                            if (!isFedEntOrg) {
                                eleEnt["organization"] = eleEnt["organization"]["@id"];
                            }
                        });
                    }
                });
                callback(null, data);
            });
        }   


        if(pageno == undefined)
        {

            Federation.find({}).select('-__v -_id -keys').populate({
            path: 'organizationId',
            select: 'name @id -_id'
        }).lean().exec(function(err, docs) {
                 if(err)
                    throw err;
                console.log("depth + pageno");
                callbackgetFederaions(err,docs,depthArr);
               });
        }
        else{

            Federation.find({}).select('-__v -_id -keys').skip(pageno*pageLength).limit(pageLength).populate({
            path: 'organizationId',
            select: 'name @id -_id'
        }).lean().exec(function(err, docs) {
                if(err)
                    throw err;
                console.log("depth + pageno");
                callbackgetFederaions(err,docs,depthArr);
               });

        }
    }

};


exports.addFederation = function(req, callback) {

    var valid = ajv.validate(FederationAJVSchema, req.body);
    if (valid) {

        var ObjFederation = new Federation(req.body);

        ObjFederation.save(function(err, obj) {
            if (err) throw (err)
            createKeyPairAndAddtoFederation(ObjFederation._id,'RS256', function(err, data) {

                console.log("Err :" + err);
                console.log("Data :" + data);

            });

            createKeyPairAndAddtoFederation(ObjFederation._id,'RS384', function(err, data) {

               console.log("Err :" + err);
                console.log("Data :" + data);

            });

            createKeyPairAndAddtoFederation(ObjFederation._id,'RS512', function(err, data) {

                console.log("Err :" + err);
                console.log("Data :" + data);

            });

            callback(null, obj._id);
        });
    } else {
        var errorMsg = Array();
        ajv.errors.forEach(function(element) {
            errorMsg.push(element.message);
        });
        callback({
            "error": errorMsg,
            "code": 400
        }, null);
    }1
};

function createKeyPairAndAddtoFederation(fid,alg, callback) {
    if (!mongoose.Types.ObjectId.isValid(fid))
        callback({
            "error": ["Invalid Federation Id"],
            "code": 400
        }, null);

    Federation.findOne({
        _id: fid
    }, function(err, fed) {

        if (err)
            callback(err, null);
        var pair = keypair();
        var doc = {};
        doc.privatekey = pair.private;
        doc.publickey = pair.public;
        doc.keyguid = Guid.raw();
        doc.alg = alg;
        
        fed.keys.push(doc);
        fed.save();
        callback(null, fed);

    });
}

exports.findFederation = function(req, callback) {

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        callback({
            "error": ["Invalid Federation Id"],
            "code": 400
        }, null);


    if (req.query.depth == null) {
        Federation.findOne({
            _id: req.params.id
        }).select('-__v -_id -keyguid').populate({
            path: 'entities',
            select: '-__v -_id'
        }).populate({
            path: 'organizationId',
            select: 'name @context @id -_id'
        }).lean().exec(function(err, federation) {
            if (err) throw (err);
            if (federation == undefined || federation == null) {
                callback({
                    "error": ["Federation doesn't exist"],
                    "code": 404
                }, null);
            }
            for (var j = 0; j < federation.entities.length; j++) {
                if (federation.entities[j].hasOwnProperty("organizationId")) {
                    federation.entities[j]["organization"] = settings.baseURL + settings.organization + "/" + federation.entities[j].organizationId;
                    delete federation.entities[j].organizationId;
                }
            }

            federation["organization"] = federation["organizationId"];
            delete federation.organizationId;
            if (req.query.filter == null)
                callback(null, federation);
            else {
                // Apply jsPath filter here.
                var filterdata = JSPath.apply(req.query.filter, federation);
                callback(null, filterdata);
            }

        });
    } else if (req.query.depth == "entities.organization") {
        Federation.findOne({
            _id: req.params.id
        }).select('-__v -_id -keys').populate({
            path: 'organizationId',
            select: 'name @id -_id'
        }).lean().exec(function(err, docs) {
            Federation.deepPopulate(docs, 'entities.organizationId', function(err, doc) {
                var data = JSON.parse(JSON.stringify(doc));
              //  data.forEach(function(element) {
                    data.entities.forEach(function(ele) {
                        ele["organization"] = ele.organizationId;
                        delete ele.organizationId;
                    });
             //   });

                if (req.query.filter == null)
                    callback(null, data);
                else {
                    // Apply jsPath filter here.
                    var filterdata = JSPath.apply(req.query.filter, data);
                    callback(null, filterdata);
                }

            });
        });
    } else {
        callback({
            "error": ['unknown value for depth parameter'],
            "code": 400
        }, null);
    }


};

exports.getJWKsForFederation = function(req,callback){
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
        callback({
            "error": ["Invalid Federation Id"],
            "code": 400
        },null);

     Federation.findOne({
        _id: req.params.id
    }, "keys", function(err, doc) {
        if(doc.keys == undefined || doc.keys==null)
            callback({
                "error": ["Keys not available for federation"],
                "code": 400
            },null);

         var jwks=[];   
        for(var i=0;i<doc.keys.length;i++)
        {
             var jwk = pem2jwk(doc.keys[i].publickey);
             jwk.alg=doc.keys[i].alg;
             jwk.use='sign';
             jwk.kid = doc.keys[i].keyguid;
             jwks.push(jwk);

        }    

       
        callback(null,{'jwks':jwks});
    });   


};

exports.deleteFederation = function(req, callback) {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        callback({
            "error": ["Invalid Federation Id"],
            "code": 400
        }, null);
    Federation.find({
        _id: req.params.id
    }, "_id", function(err, docs) {
        if (err) throw (err);

        if (docs.length == 0) {
            callback({
                "error": ["Federation doesn't exist"],
                "code": 404
            }, null);
        }
        Federation.findOneAndRemove({
            _id: req.params.id
        }, function(err) {
            if (err) callback(err, null);
            callback(null);
        });
    });
};

exports.updateFederation = function(req, callback) {

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
        callback({
            "error": ["Invalid Federation Id"],
            "code": 400
        }, null);

    var valid = ajv.validate(FederationAJVSchema, req.body);
    if (valid) {

        Federation.findOne({
            _id: req.params.id
        }).exec(function(err, doc) {

            if (err) {
                throw (err);
            } else if (doc == null || doc == undefined) {
                callback({
                    "error": ["Federation doesn't exist"],
                    "code": 404
                }, null);
            } else {
                Federation.findOneAndUpdate({
                    _id: req.params.id
                }, req.body, function(err, data) {
                    if (err) throw (err);
                    callback(null, data);
                });

            }
        });
    } else {

        var errorMsg = Array();
        ajv.errors.forEach(function(element) {
            errorMsg.push(element.message);
        });
        callback({
            "error": errorMsg,
            "code": 400
        }, null);
    }

};

exports.joinFederation = function(req, callback) {

    if (!mongoose.Types.ObjectId.isValid(req.params.fid))
        callback({
            "error": ["Invalid Federation Id"],
            "code": 400
        }, null);
    if (!mongoose.Types.ObjectId.isValid(req.params.eid))
        callback({
            "error": ["Invalid Federation Entity Id"],
            "code": 400
        }, null);
    Federation.findOne({
        _id: req.params.fid
    }, function(err, doc) {
        if (err)
            throw (err);
        if (doc == null)
            callback("Federation doesn't exist", null);

        if (doc.entities.indexOf(req.params.eid) > -1)
            callback({
                "error": ["Federation Entity already exist"],
                "code": 400
            }, null);
        else {
            var query = FederationEntity.findOne({
                _id: req.params.eid
            }).select('-_id -__v');

            query.exec(function(err, docs) {
                if (err) throw (err);
                if (docs == null || docs == undefined)
                    callback({
                        "error": ["Federation Entity doesn't exist"],
                        "code": 404
                    }, null);
                else {
                    doc.entities.push(req.params.eid);
                    doc.save();
                    callback(null, doc);
                }


            });
        }
    });

};

exports.leaveFederation = function(req, callback) {

    if (!mongoose.Types.ObjectId.isValid(req.params.fid))
        callback('Invalid Federation Id');
    if (!mongoose.Types.ObjectId.isValid(req.params.eid))
        callback('Invalid Federation Entity Id');

    Federation.findOne({
        _id: req.params.fid
    }, function(err, doc) {

        if (err)
            callback(err, null);
        if (doc == null)
            callback({
                "error": ["Federation doesn't exist"],
                "code": 404
            }, null);

        var index = doc.entities.indexOf(req.params.eid);
        if (index > -1) {
            doc.entities.splice(index, 1);
            doc.save();
            callback(null, doc);
        } else {
            callback({
                "error": ['Entity doesn\'t exist in Federation'],
                "code": 404
            }, null);
        }
    });
};