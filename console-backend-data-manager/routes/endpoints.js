/*-------------------------------------------------------------------------------
* Name:        endpoints.js
* Purpose:     PNDA Console Data Manager Packages API retrieving endpoints
*              information from the PNDA Deployment Manager.
* Requires:    express, cors, Q, HTTP, logger, config
*
* Author:      PNDA Team
* Created:     2016/01/01
* History:     2016/01/01 - Initial commit
*
* Copyright (c) 2016 Cisco and/or its affiliates.
*
* This software is licensed to you under the terms of the Apache License,
* Version 2.0 (the "License").  You may obtain a copy of the License at
* http://www.apache.org/licenses/LICENSE-2.0
*
* The code, technical concepts, and all information contained herein, are the
* property of Cisco Technology, Inc. and/or its affiliated entities, under
* various laws including copyright, international treaties, patent, and/or
* contract. Any use of the material herein must be in accordance with the terms
* of the License. All rights not expressly granted by the License are reserved.
*
* Unless required by applicable law or agreed to separately in writing,
* software distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*-------------------------------------------------------------------------------*/

var express = require('express');
var router = express.Router();
var cors = require('cors');

var Q = require('q');
var HTTP = require("q-io/http");

var logger = require("../../console-backend-utils/logger");
var corsParameters = require("../../console-backend-utils/corsParameters");
var config = require('../conf/config');

/**
 * Get list of environment endpoints.
 */
router.get('/', cors({ origin: corsParameters.verifyOrigin(config.whitelist) }), function(req, res) {
  // get list of packages asynchronously
  var getEndpoints = function() {
    var deferred = Q.defer();
    var endpointsAPI = config.deployment_manager.host + config.deployment_manager.API.endpoints;
    logger.debug("get endpoints:", endpointsAPI);
    HTTP.request({ url: endpointsAPI }).then(function successCallback(res) {
      return res.body.read().then(function(bodyStream) {
        var body = bodyStream.toString('UTF-8');
        return deferred.resolve(body);
      });
    }, function errorCallback(error) {
      logger.error("packages available error response", error);

      // called asynchronously if an error occurs
      // or server returns response with an error status.
      deferred.reject('error ' + error);
    });

    return deferred.promise;
  };

  var promise = Q.all([getEndpoints()]);
  promise.then(function(results) {
    var endpoints;
    try {
      endpoints = JSON.parse(results[0]);
    }
    catch (e) {
      logger.error("endpoints - invalid results", results[0], e);
    }

    res.json({ endpoints: endpoints });
  });
});

module.exports = router;
