/*-------------------------------------------------------------------------------
* Name:        postPackage.spec.js
* Purpose:     Frisby file for testing the /packages API.
*
* Author:      PNDA Team
* Created:     2016/04/07
* History:     2016/04/07 - Initial commit
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

var frisby = require('frisby');

var id = "frisby-package";
var state = "running";
var timestamp = 1460132331;
var message = {
	"data": [
  	{
  		"id": id,
  		"state": state,
  		"timestamp": timestamp
  	}
	],
	"timestamp": timestamp
};

frisby.create('POST package')
  .post('http://localhost:3001/packages',
    message,
    {json: true},
    {headers: {'Content-Type': 'application/json'}})
  .expectStatus(200)
  .expectHeader('Content-Type', 'text/plain; charset=utf-8')
  .after(function (err, res, body) {
    expect(body).toMatch('OK')
    frisby.create('GET package')
      .get('http://localhost:3123/api/dm/applications/' + id)
      .expectStatus(200)
      .expectHeaderContains('Content-Type', 'application/json')
      .expectJSON({
        // test that it worked
      })
      .toss();
  })
  .toss();
