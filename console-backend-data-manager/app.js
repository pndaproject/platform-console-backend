/*-------------------------------------------------------------------------------
* Name:        app.js
* Purpose:     SocketIO / Redis app providing REST APIs to the console front-end
*              to retrieve data and a web sockets API for real-time notifications.
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

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');
var path = require('path');
var logger = require("../console-backend-utils/logger")('../console-backend-data-manager/conf/logger.json');
var dbManager = require('../console-backend-utils/dbManager')(logger);
var config = require('./conf/config');
var cors = require('cors');
var corsParameters = require("../console-backend-utils/corsParameters");
var corsOptions = { origin: corsParameters.verifyOrigin(config.whitelist), credentials:true };
var Q = require('q');
var HTTP = require("q-io/http");
var session = require('express-session');
var passportSocketIo = require('passport.socketio');
var redis = require('redis');
var RedisStore = require("connect-redis")(session);

// if the user is authenticated
var passport = require('passport');
var isAuthenticated = function (req, res, next) {
  if (!req.isAuthenticated()) {
    res.json("not authenticated");
  } else {
    return next();
  }
};

var sessionStore = new RedisStore({ client: redis.createClient() });

var pam = require('./routes/pam_login')(express, logger, passport, config);
var routes = require('./routes/index')(express, logger, config, Q, HTTP, dbManager, isAuthenticated);
var metrics = require('./routes/metrics')(express, logger, config, dbManager, isAuthenticated);
var packages = require('./routes/packages')(express, logger, config, Q, HTTP, isAuthenticated);
var applications = require('./routes/applications')
  (express, logger, config, Q, HTTP, isAuthenticated);
var endpoints = require('./routes/endpoints')(express, logger, config, Q, HTTP, isAuthenticated);
var datasets = require('./routes/datasets')(express, logger, config, Q, HTTP, isAuthenticated);
var cookieParser = require('cookie-parser');
var hostname = process.env.HOSTNAME || 'localhost';
var port = parseInt(process.env.PORT, 10) || 3123;

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  store: sessionStore,
  secret: config.session.secret,
  resave: true,
  saveUninitialized: true,
  rolling: true,
  cookie: { maxAge: config.session.max_age }
}));

function onAuthorizeSuccess(data, accept) {
  logger.info('successful connection to socket.io');
  accept();
}

function onAuthorizeFail(data, message, error, accept) {
  if (error)
      throw new Error(message);
  logger.error('failed connection to socket.io:', message);
  
  if (error)
      accept(new Error(message));
}

io.use(passportSocketIo.authorize({
  store: sessionStore,
  key: 'connect.sid',
  secret: config.session.secret,
  passport: passport,
  cookieParser: cookieParser,
  success:     onAuthorizeSuccess,
  fail:        onAuthorizeFail
}));

// passport
app.use(passport.initialize());
app.use(passport.session());

// Start simple http server
http.listen(port, hostname);

// Setup App routes
app.use('/', routes); // simple response for getting current app version info etc if we want it

app.use('/metrics', metrics);
app.use('/applications', applications);
app.use('/packages', packages);
app.use('/endpoints', endpoints);
app.use('/pam', pam);
app.use('/datasets', datasets);
app.use('/node_modules', express.static('node_modules'));
app.use('/docs', express.static('docs'));

// Redis Client Channel Subscription - need to to pick up message from Redis
// NOTE: We are using different channels to communicate any data updates on the backend; all updates
// are published to the client and it's up to them to filter as needed.
// Metric Subscriber
var backendDataUpdateMetricSubscriber = redis.createClient();
backendDataUpdateMetricSubscriber.subscribe('platform-console-backend-metric-update');

// Package Subscriber
var backendDataUpdatePackageSubscriber = redis.createClient();
backendDataUpdatePackageSubscriber.subscribe('platform-console-backend-package-update');

// Application Subscriber
var backendDataUpdateApplicationSubscriber = redis.createClient();
backendDataUpdateApplicationSubscriber.subscribe('platform-console-backend-application-update');

logger.info("PNDA Platform Console Backend Data Manager started...");
logger.info("Open a web browser and go to http://" + hostname + ":" + port + "/");

// Single function for emitting forward notifications based on what has been received from the backend notifications
function emitNotification(channel, notification, data) {
  // Deserialize the message from the backend pub/sub message and then do what we need to post the relevant data
  // on to the connected clients.
  var messageObj = JSON.parse(data);
  logger.debug("Received '" + JSON.stringify(messageObj) + "' over channel " + channel);

  // emit notification to all connected clients
  io.sockets.emit(notification, messageObj);
}

// Metric Subscriber
backendDataUpdateMetricSubscriber.on('message', function(channel, message) {
  emitNotification(channel, 'platform-console-frontend-metric-update', message);
});

// Package Subscriber
backendDataUpdatePackageSubscriber.on('message', function(channel, message) {
  emitNotification(channel, 'platform-console-frontend-package-update', message);
});

// Application Subscriber
backendDataUpdateApplicationSubscriber.on('message', function(channel, message) {
  emitNotification(channel, 'platform-console-frontend-application-update', message);
});

module.exports = app;

