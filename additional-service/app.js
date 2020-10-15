/*
 * JBoss, Home of Professional Open Source
 * Copyright 2016, Red Hat, Inc. and/or its affiliates, and individual
 * contributors by the @authors tag. See the copyright.txt in the
 * distribution for a full listing of individual contributors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var Keycloak = require('keycloak-connect');
var cors = require('cors');
var jwt = require('jsonwebtoken')

var app = express();
app.use(bodyParser.json());

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Enable CORS support
app.use(cors());

// Create a session-store to be used by both the express-session
// middleware and the keycloak middleware.

var memoryStore = new session.MemoryStore();

app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

function isEmpty(val){
  return (val === undefined || val == null || val.length <= 0) ? true : false;
}

function printJWT(jwtToken) {
  if (!isEmpty(jwtToken)) {
    if (!isEmpty(jwtToken.preferred_username)) {
      console.log('preferred_username=' + jwtToken.preferred_username)
    }
    if (!isEmpty(jwtToken.email)) {
      console.log('email=' + jwtToken.email)
    }
    if (!isEmpty(jwtToken.name)) {
      console.log('name=' + jwtToken.name)
    }
    if (!isEmpty(jwtToken.given_name)) {
      console.log('given_name=' + jwtToken.given_name)
    }
    if (!isEmpty(jwtToken.family_name)) {
      console.log('family_name=' + jwtToken.family_name)
    }
  }
}

// Provide the session store to the Keycloak so that sessions
// can be invalidated from the Keycloak console callback.
//
// Additional configuration is read from keycloak.json file
// installed from the Keycloak web console.

var keycloak = new Keycloak({
  store: memoryStore
});

app.use(keycloak.middleware({
  logout: '/logout',
  admin: '/'
}));

app.get('/public', function (req, res) {
  res.json({message: 'additional-public'});
});

app.get('/secured', keycloak.protect('realm:user'), function (req, res) {
  console.log('MIKE-secured-additional-1')
  if (req.headers.authorization) {
    console.log(req.headers.authorization)
    console.log('MIKE-secured-additional-1.a')
    jwtToken = jwt.decode(req.headers.authorization.substring(7))
    console.log('MIKE-secured-additional-1.b')
    console.log(jwtToken)
  }
  res.json({message: 'additional-secured'});
});

app.get('/admin', keycloak.protect('realm:superadmin'), function (req, res) {
  console.log('MIKE-additional-admin-1')
  //console.log(res)
  if (req.headers.authorization) {
    console.log(req.headers.authorization)
    console.log('MIKE-additional-admin-1.a')
    jwtToken = jwt.decode(req.headers.authorization.substring(7))
    console.log('MIKE-additional-admin-1.b')
    printJWT(jwtToken)
    console.log(jwtToken)
  }
  res.json({message: 'additional-admin'});
});

app.listen(8081, function () {
  console.log('Started at port 8081');
});
