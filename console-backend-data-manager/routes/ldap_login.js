/*-------------------------------------------------------------------------------
* Name:        index.js
* Purpose:     Route for the /login API for LDAP user authentication.
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

var express = require('express');
var acl = require('acl');
var router = express.Router();
var ldap = require('ldapjs');

var config = require('../conf/ldap_config');
var logger = require("../../console-backend-utils/logger");

var domainComponent = config.ldap.domain_component;

//Base64 encoding/decoding service
var Base64 = {
  encode: function (input) {
    return new Buffer(input).toString('base64');
  },

  decode: function (input) {
    return new Buffer(input, 'base64').toString('ascii');
  }
};

//use the acl module to provide roles
/*jshint -W055 */

// ignore jshint's warning about constructor names having to start with an uppercase letter
acl = new acl(new acl.memoryBackend());

//defined three roles for simplicity sake

acl.allow(config.ldap.roles[0], 'engineerstuff', config.ldap.permissions);
acl.allow(config.ldap.roles[1], 'operatorstuff', config.ldap.permissions);

var ouArray = config.ldap.roles; // get the roles from config file
var count = 0;

function exit(err, response) {
  if (err.code === 'ECONNREFUSED') {
    response.sendStatus(500);
    response.end();
  }
}

function authDN(dn, password, cb, username, response) {
  var client = ldap.createClient({
    url: 'ldap://' + config.ldap.url + ':' + config.ldap.port
  });

  logger.debug(dn);

  client.on('error', function(err) {
    logger.error(err.code);
    exit(err, response);
  });

  client.bind(dn, Base64.decode(password), function (err) {
    client.unbind();
    cb(err === null, err, response, dn, username, password);
  });
}

function output(res, err, response, dn, username, pass) {
  if (res) {
    logger.info('ldap_login successful');
    var role = dn.match(/ou=(.*?),/i)[1];

    //add role to acl global object
    acl.addUserRoles(username, role);

    acl.isAllowed(username, 'engineerstuff', 'edit', function(err, res) {
      if (res) {
        response.status(200);
        response.json({ userName: username,
                        success: true,
                        canEdit: true,
                        role: role });
        count = 0;
      }
    });

    acl.isAllowed(username, 'operatorstuff', 'edit', function(err, res) {
      if (res) {
        response.status(200);
        response.json({ userName: username,
                        success: true,
                        canEdit: true,
                        role: role });
        count = 0;
      }
    });
    acl.isAllowed(username, 'operatorstuff', 'view', function(err, res) {
      if (res) {
        acl.isAllowed(username, 'engineerstuff', 'view', function(err, res1) {
          if (res1) {
            response.status(200);
            response.json({ userName: username,
                            success: true,
                            canEdit: false,
                            role: role });
            count = 0;
          }
        });
      }
    });
  } else {
    logger.error('ldap_login failed');
    count += 1;

    if (count === ouArray.length) {
      response.status(200);
      response.json({ userName: username,
                      success: false,
                      function: "None" });
    } else {
      dn = 'uid=' + username + ',ou=' + ouArray[count] + "," + domainComponent; //try another ou group
      authDN(dn, pass, output, username, response);
    }
  }
}

router.get('/', function (req, res) {
  res.render('index');
});

router.post('/validate', function(request, response) {
  count = 0;
  var username = request.body.username;
  var pass = request.body.password; //should be encrypted before calling

  // CORS
  response.header("Access-Control-Allow-Origin", "*");

  var dn = 'uid=' + username + ',ou=' + ouArray[count] + "," + domainComponent;

  authDN(dn, pass, output, username, response); //first call
});

module.exports = router;
