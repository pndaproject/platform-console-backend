/*-------------------------------------------------------------------------------
* Name:        applications.js
* Purpose:     Route for the /applications API that can be used to retrieve the
*              list of applications, get details or the status for an application,
*              create an application from a package, start/stop/delete an app.
*
* Author:      PNDA Team
* Created:     2016/02/01
* History:     2016/02/01 - Initial commit
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

module.exports = function(express, logger, config, Q, HTTP, isAuthenticated) {

  var router = express.Router();

  function getApplicationDetails(id) {
    var deferred = Q.defer();
    var url = config.deployment_manager.host + config.deployment_manager.API.applications + "/" + id;
    logger.debug("get application details:", url);
    HTTP.request({ url: url }).then(function successCallback(res) {
      return res.body.read().then(function(bodyStream) {
        var body = bodyStream.toString('UTF-8');
        return deferred.resolve(body);
      });
    }, function errorCallback(error) {
      logger.error("get application details error response", error);
      deferred.reject('error ' + error);
    });

    return deferred.promise;
  }

  function getApplicationStatus(id) {
    var deferred = Q.defer();
    var url = config.deployment_manager.host + config.deployment_manager.API.applications + "/" + id + "/status";
    logger.debug("get application status:", url);
    HTTP.request({ url: url }).then(function successCallback(res) {
      return res.body.read().then(function(bodyStream) {
        var body = bodyStream.toString('UTF-8');
        return deferred.resolve(body);
      });
    }, function errorCallback(error) {
      logger.error("get application details error response", error);
      deferred.reject('error ' + error);
    });

    return deferred.promise;
  }

  function getApplicationSummary(id) {
    var deferred = Q.defer();
    var url = config.deployment_manager.host + config.deployment_manager.API.applications + "/" + id + "/summary";
    logger.debug("get application summary:", url);
    HTTP.request({ url: url }).then(function successCallback(res) {
      return res.body.read().then(function(bodyStream) {
        var body = bodyStream.toString('UTF-8');
        return deferred.resolve(body);
      });
    }, function errorCallback(error) {
      logger.error("get application details error response", error);
      deferred.reject('error ' + error);
    });

    return deferred.promise;
  }

  /* GET Application listing. */
  router.get('/', isAuthenticated, function(req, res) {
    // get list of packages asynchronously
    var getApplications = function() {
      var deferred = Q.defer();
      var url = config.deployment_manager.host + config.deployment_manager.API.applications;
      logger.debug("get applications:", url);
      HTTP.request({ url: url }).then(function successCallback(res) {
        return res.body.read().then(function(bodyStream) {
          var body = bodyStream.toString('UTF-8');
          return deferred.resolve(body);
        });
      }, function errorCallback(error) {
        logger.error("get applications error response", error);

        // called asynchronously if an error occurs
        // or server returns response with an error status.
        deferred.reject('error ' + error);
      });

      return deferred.promise;
    };

    var promise = Q.all([getApplications()]);
    promise.then(function success(results) {
      var applications = [];
      try {
        var apps = JSON.parse(results[0]);
        var applicationDetailsCalls = [];
        for (var i = 0 ; i < apps.length ; i++) {
          applicationDetailsCalls.push(getApplicationDetails(apps[i]));
        }

        var applicationDetailsPromises = Q.all(applicationDetailsCalls);
        applicationDetailsPromises.then(function(applicationDetailsData) {
          for (var i = 0 ; i < apps.length ; i++) {
            var details = {};
            try {
              details = JSON.parse(applicationDetailsData[i]);
            } catch (e) {
              logger.error("invalid application details results", applicationDetailsData[i]);
            }

            applications.push(details);
          }

          res.json({ applications: applications });
        });
      } catch (e) {
        logger.error("invalid results", results[0]);
        res.json({ applications: applications });
      }
    }, function error(err) {
      logger.error("failed to get applications", err);
      res.json(err);
    });
  });

  /* GET Application by id. */
  router.get('/:id', isAuthenticated, function(req, res) {
    var id = req.params.id;
    var promise = Q.all([getApplicationDetails(id)]);
    promise.then(function(results) {
      var details = {};
      try {
        details = JSON.parse(results[0]);
      } catch (e) {
        logger.error("invalid results", results[0]);
      }

      res.json(details);
    });
  });

  /* GET Application status by id. */
  router.get('/:id/status', isAuthenticated, function(req, res) {
    var id = req.params.id;
    var promise = Q.all([getApplicationStatus(id)]);
    promise.then(function(results) {
      var details = {};
      try {
        details = JSON.parse(results[0]);
      } catch (e) {
        logger.error("invalid results", results[0]);
      }

      res.json(details);
    });
  });

  /* GET Application summary by id. */
  router.get('/:id/summary', isAuthenticated, function(req, res) {
    var id = req.params.id;
    var promise = Q.all([getApplicationSummary(id)]);
    promise.then(function(results) {
      var details = {};
      try {
        details = JSON.parse(results[0]);
      } catch (e) {
        logger.error("invalid results", results[0]);
      }

      res.json(details);
    });
  });

  /* Start or Stop an application by id */
  router.post('/:id/:action', isAuthenticated, function(req, res) {
    var applicationId = req.params.id;
    var action = req.params.action;
    var userName = req.query.user;

    if (applicationId === undefined || applicationId === "" || action === undefined) {
      logger.error("Missing required key params to start or stop an application");
      res.sendStatus(404);
    } else if (action !== "start" && action !== "stop") {
      logger.error("Invalid action to start or stop an application", action);
    } else {
      logger.info("Application " + applicationId + action);
      var request = {
        url: config.deployment_manager.host + config.deployment_manager.API.applications +
          "/" + applicationId + "/" + action + '?user=' + userName,
        method: "POST"
      };
      var statusRet = 500;
      HTTP.request(request)
           .then(function(response) {
             logger.info(request.method, request.url, "success: ", response.status);
             statusRet = response.status; return response.body.read();
           }, function(error) {
             logger.error(request.method, request.url, "error: ", error.status);
             statusRet = error.status;
           })
           .then(function(data) { res.status(statusRet).send(data); }, function() { res.sendStatus(500);});
    }
  });

  /**
   * Delete an application by id
   */
  router.delete('/:id', isAuthenticated, function(req, res) {
    var applicationId = req.params.id;
    var userName = req.query.user;

    if (applicationId === undefined || applicationId === "") {
      logger.error("Missing required key params to delete an application");
      res.sendStatus(404);
    } else {
      logger.info("Application " + applicationId + "DELETING ");
      var request = {
        url: config.deployment_manager.host + config.deployment_manager.API.applications + 
          "/" + applicationId + '?user=' + userName,
        method: "DELETE"
      };
      var statusRet = 500;
      HTTP.request(request)
           .then(function(response) {
             logger.info(request.method, request.url, "success: ", response.status);
             statusRet = response.status; return response.body.read();
           }, function(error) {
             logger.error(request.method, request.url, "error: ", error.status);
             statusRet = error.status;
           })
           .then(function(data) { res.status(statusRet).send(data); }, function() { res.sendStatus(500);});
    }
  });

  /**
   * Create an application from a package
   */
  router.put('/:id', isAuthenticated, function(req, res) {
    var applicationId = req.params.id;
    var body = JSON.stringify(req.body);
    var userName = req.query.user;

    if (applicationId === undefined || applicationId === "") {
      logger.error("Missing required key params to create an application");
      res.sendStatus(404);
    } else if (req.body.package === undefined || req.body.package === null || req.body.package === "") {
      logger.error("Invalid package name : ", req.body.package);
    } else {
      logger.info("Application being created :" + applicationId + " from package " + req.body.package);
      var request = {
        url: config.deployment_manager.host + config.deployment_manager.API.applications + 
          "/" + applicationId + '?user=' + userName,
        method: "PUT",
        body: [body],
        headers: { "Content-Type": "application/json" }
      };
      var statusRet = 500;
      HTTP.request(request)
           .then(function(response) {
             logger.info(request.method, request.url, "success: ", response.status);
             statusRet = response.status; return response.body.read();
           }, function(error) {
             logger.error(request.method, request.url, "error: ", error.status);
             statusRet = error.status;
           })
           .then(function(data) { res.status(statusRet).send(data); }, function() { res.sendStatus(500);});
    }
  });

  return router;
};
