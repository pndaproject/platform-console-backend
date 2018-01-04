/*-------------------------------------------------------------------------------
* Name:        metrics.js
* Purpose:     PNDA Console Data Manager Packages API retrieving information
*              about packages available and being deployed from the PNDA
*              Deployment Manager.
*
* Author:      PNDA Team
* Created:     2016/03/01
* History:     2016/03/01 - Initial commit
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

  function getAvailablePackages() {
    var deferred = Q.defer();
    var packagesAvailable = config.deployment_manager.host + config.deployment_manager.API.packages_available;
    logger.info("get packages available:", packagesAvailable);
    HTTP.request({ url: packagesAvailable }).then(function successCallback(res) {
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
  }

  function getPackageStatus(id) {
    var deferred = Q.defer();
    var url = config.deployment_manager.host + config.deployment_manager.API.packages + "/" + id + "/status";
    logger.debug("get package status:", url);
    HTTP.request({ url: url }).then(function successCallback(res) {
      return res.body.read().then(function(bodyStream) {
        var body = bodyStream.toString('UTF-8');
        return deferred.resolve(body);
      });
    }, function errorCallback(error) {
      logger.error("get package status details error response", error);
      deferred.reject('error ' + error);
    });

    return deferred.promise;
  }

  function getDeployedPackages() {
    var deferred = Q.defer();
    var deployed = config.deployment_manager.host + config.deployment_manager.API.packages;
    logger.info("get deployed packages:", deployed);
    HTTP.request({ url: deployed }).then(function successCallback(res) {
      return res.body.read().then(function(bodyStream) {
        var body = bodyStream.toString('UTF-8');
        return deferred.resolve(body);
      });
    }, function errorCallback(error) {
      logger.error("deployed packages error response", error);

      // called asynchronously if an error occurs
      // or server returns response with an error status.
      deferred.reject('error ' + error);
    });

    return deferred.promise;
  }

  /* Get a list of packages available and deployed. */
  router.get('/', isAuthenticated, function(req, res) {
    var promise = Q.all([getAvailablePackages(), getDeployedPackages()]);
    promise.then(function(results) {
      var packages = [];
      try {
        var available = JSON.parse(results[0]);
        available.forEach(function(p) {
          var newPackage = {
            name: p.name,
            available_versions: [],
            deployed_versions: []
          };
          p.latest_versions.forEach(function(version) {
            newPackage.available_versions.push({
              version: version.version,
              status: "NOTDEPLOYED"
            });
          });
          packages.push(newPackage);
        });
      }
      catch (e) {
        logger.error("available packages - invalid results", results[0], e);
      }

      try {
        var deployed = JSON.parse(results[1]);

        var findPackageByName = function(name) {
          var found;
          for (var j = 0 ; j < packages.length ; j++) {
            if (packages[j].name === name) {
              found = packages[j];
              break;
            }
          }

          return found;
        };

        for (var i = 0 ; i < deployed.length ; i++) {
          var p = deployed[i];
          var match;
          if ((match = p.match(/^(.*)-([\d\.]*)$/i)) !== null) {
            var packageName = match[1];
            var version = match[2];
            var found = findPackageByName(packageName);
            logger.debug("found", found);
            if (found !== undefined) {
              for (var v = 0 ; v < found.available_versions.length ; v++) {
                if (found.available_versions[v].version === version) {
                  found.available_versions[v].status = "DEPLOYED";
                }
              }

              found.deployed_versions.push(version);
            } else {
              packages.push({
                name: packageName,
                available_versions: [{
                  version: version,
                  status: "DEPLOYED"
                }],
                deployed_versions: [version]
              });
            }
          } else {
            logger.warn("Deployed package", p, "does not match name-version pattern");
          }
        }
      }
      catch (e) {
        logger.error("deployed packages - invalid results", results[1], e);
      }

      res.json({ packages: packages });
    });
  });

  /* Get a list of deployed packages. */
  router.get('/deployed', isAuthenticated, function(req, res) {
    var promise = Q.all([getDeployedPackages()]);
    promise.then(function(results) {
      var packages = [];
      try {
        packages = JSON.parse(results[0]);
      }
      catch (e) {
        logger.error("deployed packages - invalid results", results[0], e);
      }

      res.json({ deployedPackages: packages });
    });
  });

  /* GET Package status by id. */
  router.get('/:id/status', isAuthenticated, function(req, res) {
    var id = req.params.id;
    var promise = Q.all([getPackageStatus(id)]);
    promise.then(function(results) {
      var details = {};
      try {
        details = JSON.parse(results[0]);
        logger.info(results);
      } catch (e) {
        logger.error("invalid results", results[0]);
      }

      res.json(details);
    });
  });

  /* Get package information by id. */
  router.get('/:id', isAuthenticated, function(req, res) {
    var getPackagesDetails = function(id) {
      var deferred = Q.defer();
      var url = config.deployment_manager.host + config.deployment_manager.API.packages + '/' + id;
      logger.info("getPackageDetails:", url);
      HTTP.request({ url: url }).then(function successCallback(res) {
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

    var promise = Q.all([getPackagesDetails(req.params.id)]);
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
   * Deploy a package
   */
  router.put('/:id', isAuthenticated, function(req, res) {
    var packageId = req.params.id;
    var deployAPI = config.deployment_manager.host + config.deployment_manager.API.packages + '/' + packageId;
    logger.debug("packageId", packageId);

    if (packageId && packageId !== "") {
      logger.info("Deploying package " + packageId + " to " + req.body.action);

      var request = {
        url: deployAPI,
        method: "PUT"
      };
      logger.debug('deploy API call:', request.method, deployAPI);
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
    } else {
      logger.error("Missing required package id to deploy the package");
      res.sendStatus(500);
    }
  });

  /**
   * Undeploy a package
   */
  router.delete('/:id', isAuthenticated, function(req, res) {
    var packageId = req.params.id;
    var deployAPI = config.deployment_manager.host + config.deployment_manager.API.packages + '/' + packageId;

    if (packageId && packageId !== "") {
      logger.info("Undeploying package " + packageId + " to " + req.body.action);

      var request = {
        url: deployAPI,
        method: "DELETE"
      };
      logger.debug('undeploy API call:', request.method, deployAPI);
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
    } else {
      logger.error("Missing required package id to undeploy the package");
      res.sendStatus(500);
    }
  });

  return router;
  
};
