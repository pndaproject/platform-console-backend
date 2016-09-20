/*-------------------------------------------------------------------------------
* Name:        logger.js
* Purpose:     Example of using Winston to configure a logging service.
* Requires:    winston
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

var config = require('./conf/config.json');
var winstonlr = require('winston-logrotate');
var rotateTransport = new winstonlr.Rotate({
        file: config.log_file,
        colorize: false,
        timestamp: true,
        level: 'info',
        handleExceptions: true,
        humanReadableUnhandledException: true,
        json: true,
        size: '10m',
        keep: 3,
        compress: false
});

var winston = require('winston')
winston.emitErrs = true;

var logger = new (winston.Logger)({ exitOnError: false, transports: [rotateTransport] });
logger.add(winston.transports.Console, {
  level: 'debug',
  timestamp: true,
  handleExceptions: true,
  json: false,
  colorize: true
});

module.exports = logger;