/*-------------------------------------------------------------------------------
* Name:        index.js
* Purpose:     Route for the /login API for PAM user authentication.
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

module.exports = function(express, logger, passport) {

  var router = express.Router();
  var pam = require('authenticate-pam');
  var CustomStrategy = require('passport-custom');

  //Base64 encoding/decoding service
  var Base64 = {
    encode: function (input) {
      return new Buffer(input).toString('base64');
    },

    decode: function (input) {
      return new Buffer(input, 'base64').toString('ascii');
    }
  };

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  passport.use('strategy-pam', new CustomStrategy(
    function(request, callback) {
      var username = request.body.username;
      var pass = Base64.decode(request.body.password);
      logger.info('pam_login username: ' + username);
      logger.info('pam_login pass: ' + request.body.password);
      logger.info('pam_login pass: ' + pass);
      pam.authenticate(username, pass, function(err) {
        if (err !== undefined) {
          logger.info('pam_login failed: ' + err);
          callback(null, false, { message: 'login failed. ' + err });
        }else {
          logger.info('pam_login successful for user:' + username);
          callback(null, username);
        }
      });
    }
  ));

  //use the acl module to provide roles
  /*jshint -W055 */

  // ignore jshint's warning about constructor names having to start with an uppercase letter

  router.get('/', function (req, res) {
    res.render('index');
  });

  router.post('/login', passport.authenticate('strategy-pam'), function(request, response) {
    response.status(200);
    response.json({ username: request.user });
  });

  router.get('/logout', function(request, response) {
    request.logout();
    response.status(200);
    response.json({ session: "logout" });
    logger.info('pam_login logout successful');
  });

  return router;
};
