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
var bodyParser = require('body-parser'),
    path = require('path');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var routes = require('./routes/index');
var metrics = require('./routes/metrics');
var packages = require('./routes/packages');
var applications = require('./routes/applications');
var endpoints = require('./routes/endpoints');
var datasets = require('./routes/datasets');
var login = require('./routes/ldap_login');

// Redis Client Support
var redis = require('redis');

// Logger
var logger = require("../console-backend-utils/logger");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var hostname = process.env.HOSTNAME || 'localhost';
var port = parseInt(process.env.PORT, 10) || 3123;

// Start simple http server
http.listen(port, hostname);

// Setup App routes
app.use('/', routes); // simple response for getting current app version info etc if we want it

// Metrics
app.use('/metrics', metrics);

// Applications
app.use('/applications', applications);

// Packages
app.use('/packages', packages);

// Endpoints
app.use('/endpoints', endpoints);

// Login
app.use('/login', login);

// Packages
app.use('/datasets', datasets);

// Docs
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

