/*-------------------------------------------------------------------------------
* Name:        dbManager.js
* Purpose:     Route for /applications API
*
* Author:      PNDA Team
* Created:     2015/11/27
* History:     2015/11/27 - Initial commit
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

// Redis DB Client
var redis = require('redis');
var redisClient = redis.createClient();

// logger
var logger = require("./logger");

function stripRedisDataIdentifiers(responseArray) {
    // Strip-out the prefix data identifier (e.g. 'metric:' etc.) as client doesn't need to care
    // about it and is an artifact of how we are storing data in redis.
  for (var i = 0; i < responseArray.length; i++) {
      //reply[i]
    if (responseArray[i].indexOf(':') !== -1) {
      // We just want everything after the colon in the key identifier for our response
      responseArray[i] = responseArray[i].split(':')[1];
    }
  }

  return responseArray;
}

module.exports = {

    // Create new data in our chosen store
  create: function (id, data, notification, callback) {
    if ((id) && (data)) {
      redisClient.hmset(id, data,
                function(err) {
                    //console.log(reply);
                  if (!err) {
                    logger.debug("Created new data: " + id + " : ", data);

                    if (notification) {
                        // Pack up our data in to a serialized object for messaging to our backend subscriber which
                        // shall parse and then do what it needs to over it frontend interface when ready.
                        // NOTE: We are reusing a single channel for redis pub/sub messaging - it's up to the client
                        // frontend to filter what messages it cares about updating.
                        // Update: now sending the whole object without filtering first
                      redisClient.publish(notification, JSON.stringify(data));
                    }
                  }

                  callback(err);
                });
    } else {
      logger.error("Failed to create new data - missing required params...");
    }
  },

  getAllKeys: function (req, stripPrefix, callback) {
    var param = "*";
    if ((req !== "") && (req !== null)) {
      param = req;
    }

    logger.debug('Attempting to get ' + param);

    redisClient.keys(param, function(err, reply) {
      if (err) {
          // One of the iterations produced an error.
          // All processing will now stop.
        logger.error('data store retrieve request failed: ' + err);
      } else {
        logger.debug('data store retrieve request processed successfully - ' + reply);
      }

      // only strip the prefix if required to do so...some callers want to see all data as stored
      callback(err, (stripPrefix === true ? stripRedisDataIdentifiers(reply) : reply));
    });
  },

  getKeyValuesForFields: function (key, fields, callback) {
    redisClient.hmget(key, fields, function(err, reply) {
      if (err) {
          // One of the iterations produced an error.
          // All processing will now stop.
        logger.error('data store retrieve request failed: ' + err);
      } else {
        logger.debug('data store retrieve request processed successfully - ' + reply);
      }

      callback(err, reply);
    });
  }

};
