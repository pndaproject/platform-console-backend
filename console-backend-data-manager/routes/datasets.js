/*-------------------------------------------------------------------------------
* Name:        datasets.js
* Purpose:     Route for the /datasets API to list datasets, get details about
*              a dataset, or change its data retention parameters.
*
* Author:      PNDA Team
* Created:     2016/04/01
* History:     2016/04/01 - Initial commit
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

module.exports = function(express, logger, cors, corsOptions, config, Q, HTTP, isAuthenticated) {

  var router = express.Router();

  router.get('/', cors(corsOptions), isAuthenticated, function(req, res) {
    // get list of packages asynchronously
    var getDatasets = function() {
      var deferred = Q.defer();
      var datasetsApi = config.dataset_manager.host + config.dataset_manager.API.datasets;
      logger.info("get datasets:", datasetsApi);
      HTTP.request({ url: datasetsApi }).then(function successCallback(res) {
        return res.body.read().then(function(bodyStream) {
          var body = JSON.parse(bodyStream.toString('UTF-8'));
          return deferred.resolve(body);
        });
      }, function errorCallback(error) {
        logger.error("datasets available error response", error);
        deferred.reject('error ' + error);
      });

      return deferred.promise;
    };

    var promise = Q.all([getDatasets()]);
    promise.then(function(results) {
      logger.info('datasets: ' + JSON.stringify(results[0]));
      res.json(results[0]);
    });
  });

  /* GET dataset by id. */
  router.get('/:id', cors(corsOptions), isAuthenticated, function(req, res) {
    var getDatasetDetails = function(id) {
      var deferred = Q.defer();
      var datasetApi = config.dataset_manager.host + config.dataset_manager.API.datasets + '/' + id;
      logger.info("getDatasetDetails:", datasetApi);
      HTTP.request({ url: datasetApi }).then(function successCallback(res) {
        return res.body.read().then(function(bodyStream) {
          var body = bodyStream.toString('UTF-8');
          return deferred.resolve(body);
        });
      }, function errorCallback(error) {
        logger.error("packages details error response", error);

        // called asynchronously if an error occurs
        // or server returns response with an error status.
        deferred.reject('error ' + error);
      });

      return deferred.promise;
    };

    var promise = Q.all([getDatasetDetails(req.params.id)]);
    promise.then(function(results) {
      var details = "";
      try {
        details = JSON.parse(results[0]);
      }
      catch (e) {
        logger.error("invalid results", results[0]);
      }

      res.json(details);
    });
  });

  /**
   * Modify data retention parameters for a dataset.
   * Example body:
   * {"mode":"archive"}
   * {"mode":"delete"}
   * {"policy":"age","max_age_days":30}
   * {"policy":"size","max_size_gigabytes":10}
   */
  router.options('/:id', cors(corsOptions)); // enable pre-flight request for PUT request
  router.put('/:id', cors(corsOptions), isAuthenticated, function(req, res) {
    logger.info('Got put request: ' + JSON.stringify(req.body));
    var datasetId = req.params.id;
    var message = req.body;
    logger.debug("PUT API body", message);
    var datasetApi = config.dataset_manager.host + config.dataset_manager.API.datasets + '/' + datasetId;
    
    if (datasetId !== undefined && datasetId !== "" && message !== undefined) {
      logger.info("Updating dataset " + datasetId + " with " + JSON.stringify(message));

      var mode = message.mode;
      var policy = message.policy;

      var request = {
        url: datasetApi,
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: [JSON.stringify(message)]
      };
      logger.debug('request: ', JSON.stringify(request));
      HTTP.request(request).then(function success(response) {
        logger.info(request.method, request.url, "successful: ", response.status);
        res.sendStatus(200);
      }, function error(error) {
        logger.error(request.method, request.url, "failed: ", error.status);
        res.sendStatus(error.status);
      });
    } else {
      var error = "Missing required key param for dataset";
      logger.error(error);
      res.sendStatus(404);
    }
  });

  return router;

};
