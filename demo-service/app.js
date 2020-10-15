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
const request = require("request");
const additionalServiceUrl = process.env.ADDITIONAL_SERVICE_URL

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
    console.log("exp: " + new Date(jwtToken.exp * 1000))
    console.log("iat: " + new Date(jwtToken.iat * 1000))
    console.log("auth_time: " + new Date(jwtToken.auth_time * 1000))
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

function sleep(milliseconds) {
  console.log("BEFORE: " + Date.now());
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
  console.log("AFTER: " + Date.now());
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
  res.json({message: 'public'});
});

app.get('/secured', keycloak.protect('realm:user'), function (req, res) {
  console.log('demo-service-secured-1')
  if (req.headers.authorization) {
    console.log(req.headers.authorization)
    console.log('demo-service-secured-1.a')
    jwtToken = jwt.decode(req.headers.authorization.substring(7))
    console.log('demo-service-secured-1.b')
    console.log(jwtToken)
  }
  res.json({message: 'secured'});
});

app.get('/admin', keycloak.protect('realm:admin'), function (req, res) {
  console.log('demo-service-admin-1')
  //console.log(res)
  if (req.headers.authorization) {
    console.log(req.headers.authorization)
    console.log('demo-service-admin-1.a')
    jwtToken = jwt.decode(req.headers.authorization.substring(7))
    console.log('demo-service-admin-1.b')
    printJWT(jwtToken)
    //console.log(jwtToken)
  }
  res.json({message: 'admin'});
});


app.get('/admin-superadmin', keycloak.protect('realm:admin'), function (req, res) {
  console.log('demo-service-jump-1')
  //console.log(res)
  if (req.headers.authorization) {
    console.log(req.headers.authorization)
    console.log('demo-service-jump-1.a')
    jwtToken = jwt.decode(req.headers.authorization.substring(7))
    console.log('demo-service-hump-1.b')
    printJWT(jwtToken)
    //console.log(jwtToken)
  }
  // wait for 90 seconds before invoking the next service (to test token expiry)
  //sleep(90 * 1000)

  // configure the request to your keycloak server
  console.log("additionalServiceUrl=" + additionalServiceUrl)
  const options = {
    method: 'GET',
    url: additionalServiceUrl,
    headers: {
      // add the token received to the userinfo request
      Authorization: req.headers.authorization,
    },
  };
  request(options, (error, response, body) => {
    if (error) throw new Error(error);

    // if the request status isn't "OK", the token is invalid
    if (response.statusCode !== 200) {
      console.log(response)
      res.status(401).json({
        error: additionalServiceUrl + ` unauthorized`,
      });
    }
    else {
      res.json({ message: `jump via ${response.body} succeeded!` });
      console.log(response);
    }
  });
});

app.listen(8080, function () {
  console.log('Started at port 8080');
});
