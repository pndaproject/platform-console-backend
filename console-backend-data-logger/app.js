/*-------------------------------------------------------------------------------
* Name:        app.js
* Purpose:     Data logger application used by other PNDA components to provide
*              data (metrics, applications and packages) to be stored in a redis
*              database. The data is accessible from a client via the data
*              manager APIs.
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
var async = require('async');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require("../console-backend-utils/logger")('../console-backend-data-logger/conf/logger.json');
var dbManager = require('../console-backend-utils/dbManager')(logger);
var cors = require('cors');
var hostname = process.env.HOSTNAME || 'localhost';
var whitelist = ['http://' + hostname, 'http://' + hostname + ':8006', 'http://0.0.0.0:8006'];
var corsOptions = {
  origin: function(origin, callback) {
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    callback(null, originIsWhitelisted);
  }
};
var metrics = require('./routes/metrics')(express, async, logger, dbManager,cors, corsOptions);
var packages = require('./routes/packages')(express, async, logger, dbManager,cors, corsOptions);
var applications = require('./routes/applications')(express, async, logger, dbManager,cors, corsOptions);
var app = express();
var cors = require('cors');
var port = parseInt(process.env.PORT, 10) || 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

// Enable reading of node app params to allow us to bind to different ip addresses or port
app.listen(port, hostname);

// Routes definition
app.use('/metrics', metrics);
app.use('/packages', packages);
app.use('/applications', applications);
app.use('/node_modules', express.static('node_modules'));
app.use('/docs', express.static('docs'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Welcome message and application info
logger.info("PNDA Console Data Logger running at http://" + hostname + ":" + port);

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.status('error').json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.status('error').json({
    message: err.message,
    error: {}
  });
});

module.exports = app;
