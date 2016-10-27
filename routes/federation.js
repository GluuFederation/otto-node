// File : routes/federations.js -->
var express = require('express');
var router = express.Router();
var settings = require("../settings");
var baseURL = settings.baseURL;
var federationURL = settings.federations;
var federationcontroller = require("../controller/federationcontroller");
var federationentitycontroller = require("../controller/federation_entitycontroller");
var jws = require('jws');
var fs = require('fs');
var keypair = require('keypair');
var pem2jwk = require('pem-jwk').pem2jwk
var algArr = ['RS256', 'RS384', 'RS512'];


/**
 * @swagger
 * resourcePath: /Federations
 * description: Open Trust Taxonomy for Federation Operators
 */


/**
 * @swagger
 * path: /otto/federations
 * operations:
 *   -  httpMethod: POST
 *      summary: Create Federation
 *      notes: Returns created FederationId
 *      nickname: Federations
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: Federation JSON
 *          description: Your Federation JSON
 *          paramType: body
 *          required: true
 *          dataType: string
 */
router.post(settings.federations, function(req, res) {

    federationcontroller.addFederation(req, function(err, data) {
        console.log(err);
        if (err) {
            res.status(err.code).json({
                "Error(s)": err.error
            });
        } else {

            res.status(201).json({
                "@id": baseURL + federationURL + "/" + data
            });
        }
    });

});

/**
 * @swagger
 * path: /otto/federations/{id}
 * operations:
 *   -  httpMethod: GET
 *      summary: Get Federation By ID
 *      notes: Returns Federations
 *      nickname: GetFederations
 *      parameters:
 *        - name: id
 *          paramType: path
 *          description: Your Federation Id
 *          required: true
 *          dataType: string
 *        - name: depth
 *          description: depth[entities.organization]
 *          paramType: query
 *          required: false
 *          dataType: string
 *        - name: filter
 *          description: jspath filter syntax
 *          paramType: query
 *          required: false
 *          dataType: string
 *        - name: sign
 *          description: Pass true to return the sign data
 *          paramType: query
 *          required: false
 *          dataType: string
 *        - name: alg
 *          description: Algorithm used for signing [RS256,RS384,RS512]
 *          paramType: query
 *          required: false
 *          dataType: string
 * 
 */
router.get(settings.federations + '/:id', function(req, res) {

    federationcontroller.findFederation(req, function(err, data) {
        if (err) {
            res.status(err.code).json({
                "Error(s)": err.error
            });
        } else {


            if (req.query.sign != null && req.query.sign != undefined) {
                if (req.query.sign == 'true') {
                    var alg = "";
                    if (req.query.alg == undefined) {
                        alg = 'RS512';
                    } else {
                        var str = req.query.alg;
                        if (algArr.indexOf(str.trim()) > -1) {
                            alg = str.trim();
                        } else {
                            res.status(400).json({
                                "Error": ['Cannot sign federation data. Algorithm not suported']
                            });
                        }
                    }

                        if (data.hasOwnProperty("keys")) {
                            var keys = data.keys;

                            delete data.keys;
                            var i = 0
                            for (i = 0; i < keys.length; i++) {
                                if (alg == keys[i].alg) {
                                    break;
                                }
                            }
                            console.log(i);
                            console.log(keys[i]);
                            try {
                                jws.createSign({
                                    header: {
                                        "alg": alg
                                    },
                                    privateKey: keys[i].privatekey,
                                    payload: data,
                                }).on('done', function(signature) {
                                    res.status(200).json({
                                        SignData: signature
                                    });

                                });
                            } catch (e) {
                                res.status(500).json({
                                    "Error": ['Error occur while signing the data.']
                                });
                            }

                        } else {
                            res.status(400).json({
                                "Error": ['Cannot sign federation data. Key not available']
                            });
                        }
                  //  }
                    //  }
                    //}




                } else {
                    res.status(400).json({
                        "Error": ['Invalid value for the sign parameter.']
                    });
                }

            } else {
                if (data.hasOwnProperty("keys"))
                    delete data.keys;

                res.status(200).json(data)
            }

        }
    });
});

/**
 * @swagger
 * path: /otto/federations/{id}/jwks
 * operations:
 *   -  httpMethod: GET
 *      summary: Get Federation jwks
 *      notes: Returns Federations jwks
 *      nickname: GetFederationsJWKs
 *      parameters:
 *        - name: id
 *          paramType: path
 *          description: Your Federation Id
 *          required: true
 *          dataType: string
 */
router.get(settings.federations + '/:id/jwks', function(req, res) {
    federationcontroller.getJWKsForFederation(req, function(err, data) {
        if (err) {

            res.status(err.code).json({
                "Error(s)": err.error
            });

        } else {

            res.status(200).json(data);
        }
    });
});

/**
 * @swagger
 * path: /otto/federations
 * operations:
 *   -  httpMethod: GET
 *      summary: Get Federations
 *      notes: Returns Federations
 *      nickname: GetFederations
 *      parameters:
 *        - name: depth
 *          description: depth[federations,federations.entities,federations.organization,federations.entities.organization]
 *          paramType: query
 *          required: false
 *          dataType: string
 *        - name: pageno
 *          description: page no (Starts from 0)
 *          paramType: query
 *          required: false
 *          dataType: string
 *        - name: pagelength
 *          description: page length
 *          paramType: query
 *          required: false
 *          dataType: string
 *      
 */
router.get(settings.federations, function(req, res) {
    try {
        federationcontroller.getAllFederationWithDepth(req, function(err, data) {
            if (err) {

                res.status(err.code).json({
                    "Error(s)": err.error
                });

            } else {

                res.status(200).json({
                    '@context': baseURL + '/otto/federation_list',
                    federations: data
                });
            }

        });
    } catch (e) {
        res.status(500).json();
    }

});

/**
 * @swagger
 * path: /otto/federations/{id}
 * operations:
 *   -  httpMethod: Delete
 *      summary: Delete federation
 *      notes: Returns federations status
 *      nickname: federations
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: id
 *          description: Your federations Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *       
 */
router.delete(settings.federations + '/:id', function(req, res) {

    try {
        federationcontroller.deleteFederation(req, function(err) {
            if (err) {
                res.status(err.code).json({
                    "Error(s)": err.error
                });
            } else {
                res.status(200).json();
            }
        });
    } catch (e) {
        res.status(500).json();
    }
});


/**
 * @swagger
 * path: /otto/federations/{id}
 * operations:
 *   -  httpMethod: PUT
 *      summary: Update federation
 *      notes: Returns Status
 *      nickname: federations
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: id
 *          description: Your federations Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: body
 *          description: Your federations Information
 *          paramType: body
 *          required: true
 *          dataType: string
 *            
 */
router.put(settings.federations + "/:id", function(req, res) {
    try {
        federationcontroller.updateFederation(req, function(err, data) {
            console.log(err);
            if (err) {
                res.status(err.code).json({
                    "Error(s)": err.error
                });
            } else {
                res.status(200).json();
            }
        });
    } catch (e) {
        res.status(500).json();
    }
});


/**
 * @swagger
 * path: /otto/federations/{federationid}/{entityid}
 * operations:
 *   -  httpMethod: Delete
 *      summary: Leave federation
 *      notes: Returns federations status
 *      nickname: LeaveFederation
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: federationid
 *          description: Your federations Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: entityid
 *          description: Your Entity Id
 *          paramType: path
 *          required: true
 *          dataType: string
 */
router.delete(settings.federations + '/:fid/:eid', function(req, res) {
    try {
        federationcontroller.leaveFederation(req, function(err, callback) {
            if (err) {
                res.status(err.code).json({
                    "Error(s)": err.error
                });
            }
            res.status(200).json();
        });
    } catch (e) {
        res.status(500).json();
    }
});

/**
 * @swagger
 * path: /otto/federations/{federationid}/{entityid}
 * operations:
 *   -  httpMethod: post
 *      summary: Join federation (Existing Entity)
 *      notes: Returns federations status
 *      nickname: JoinFederation
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: federationid
 *          description: Your federations Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: entityid
 *          description: Your Entity Id
 *          paramType: path
 *          required: true
 *          dataType: string
 */
router.post(settings.federations + '/:fid/:eid', function(req, res) {
    try {
        federationcontroller.joinFederation(req, function(err, callback) {
            if (err) {
                res.status(err.code).json({
                    "Error(s)": err.error
                });
            }
            res.status(200).json();
        });
    } catch (e) {
        res.status(500).json();
    }
});


/**
 * @swagger
 * path: /otto/federations/{federationid}
 * operations:
 *   -  httpMethod: POST
 *      summary: Join federation (Create New Entity)
 *      notes: Returns federations status
 *      nickname: JoinFederation
 *      consumes:
 *        - text/html
 *      parameters:
 *        - name: federationid
 *          description: Your federations Id
 *          paramType: path
 *          required: true
 *          dataType: string
 *        - name: entitydata
 *          description: Entity Data
 *          paramType: body
 *          required: true
 *          dataType: string  
 */
router.post(settings.federations + '/:fid/', function(req, res) {

    try {

        federationentitycontroller.addFederationEntity(req, function(err, data) {
            console.log(err);
            if (err) {
                res.status(err.code).json({
                    "Error(s)": err.error
                });
            } else {
                req.params.eid = data.toString();
                federationcontroller.joinFederation(req, function(err, callback) {
                    if (err) {
                        res.status(409).json({
                            "Error(s)": err
                        });
                    }
                    res.status(200).json();
                });
            }
        });
    } catch (e) {
        res.status(500).json();
    }

});

module.exports = router;