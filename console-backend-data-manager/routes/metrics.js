/*-------------------------------------------------------------------------------
* Name:        metrics.js
* Purpose:     Route for the /metrics API to list metrics and get details about
*              individual metrics.
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

module.exports = function(express, logger, cors, corsOptions, config, dbManager){

  var router = express.Router();

  /* GET metrics listing. */
  router.get('/', cors(corsOptions), function(req, res) {
    dbManager.getAllKeys('metric:*', true, function(error, response) {
      if (error) {
        logger.error("failed to get keys - " + error);
        res.json({ error: error });
      } else {
        res.json({ metrics: response });
      }
    });
  });

  /* GET metrics listing. */
  router.get('/:id', cors(corsOptions), function(req, res) {
    var key = req.params.id;
    var fields = ['source', 'value', 'timestamp'];

    // if we are dealing with a health-related metric then add it in to our search criteria...
    if (key.indexOf('.health') > 0) {
      fields.push('causes');
    }

    if (key !== "") {
      dbManager.getKeyValuesForFields('metric:' + key, fields, function(error, response) {
        if (error) {
          logger.error("failed to get keys - " + error);
          res.json({ error: error });
        } else {
          // var source = response[0], value = response[1]/*, timestamp = response[2]*/;
          var json = { metric: key, currentData: {} };
          for (var i = 0 ; i < fields.length ; i++) {
            json.currentData[fields[i]] = response[i];
          }

          res.json(json);
        }
      });
    } else {
      var error = "Missing required key param for metrics";
      logger.error(error);
      res.json({ error: error });
    }
  });

  return router;

};
