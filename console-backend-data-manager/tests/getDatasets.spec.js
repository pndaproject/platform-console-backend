/*-------------------------------------------------------------------------------
* Name:        getDatasets.spec.js
* Purpose:     Frisby file for testing the /datasets API.
*
* Author:      PNDA Team
* Created:     2016/04/06
* History:     2016/04/06 - Initial commit
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

function valueInList(val, list) {
  if (val === undefined) return false;
  return list.indexOf(val) !== -1;
}

var datasetTests = {
  id: String,
  path: String,
  mode: function(val) { return valueInList(val, ['archive','delete']); },
  policy: function(val) { return valueInList(val, ['age','size','nolimit']); },
  max_age_days: function(val) { expect(val).toBeTypeOrNull(Number); },
  max_size_gigabytes: function(val) { expect(val).toBeTypeOrNull(Number); }
};

frisby.create('Get datasets')
  .get('http://localhost:3123/datasets')
  .expectStatus(200)
  .expectHeaderContains('Content-Type', 'application/json')
  .expectJSONTypes('data.*', datasetTests)
  .toss();
  
frisby.create('Get dataset')
  .get('http://localhost:3123/datasets/testbot')
  .expectStatus(200)
  .expectHeaderContains('Content-Type', 'application/json')
  .expectJSONTypes('data', datasetTests)
  .toss();