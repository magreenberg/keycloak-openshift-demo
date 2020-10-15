# Keycloak Demo

This demo shows how to run Keycloak and secure different applications and services.

There are a few bits to the demo and to make it easy to deploy everything it uses MiniShift to make it 
easy to run everything on a single computer and have everything wired together properly.

Before starting the demo you need to download and install MiniShift. This is as easy as [downloading the
MiniShift distribution](https://github.com/minishift/minishift#getting-started) or running it with your favorite
`oc cluster up` command.

Once you have downloaded MiniShift start it up and make sure you install the admin-user addon. For 
simplicity you can just run `bin/start-minishift.sh` which will do this for you.

Alternatively, you can run `bin/start-oc-cluster-up.sh`, which will start your local cluster and add
Cluster Admin permissions to the `developer` user (so that you can see all the Projects in the UI Console).


## Basic demo

### Overview

The demo contains the following parts:

* Keycloak
* Node.js REST service secured with Keycloak Node.js adapter
* HTML5 application secured with Keycloak JavaScript adapter
* Spring application for Mutual TLS

## Starting Keycloak

Simply run `bin/start-keycloak.sh` and Keycloak will be deployed to OpenShift. 

To find the hostname of Keycloak run `oc get routes keycloak`. Then open https://<hostname> in your
favorite browser.

You can now login to the Keycloak admin console with username `admin` and password `admin`.

To configure Keycloak you can either create a new realm in the admin console and import `demo-realm.json`
or run `bin/configure-keycloak.sh`.

## Deploying the Node.js service

The Node.js service is a very simple API that is secured with the Keycloak Node.js adapter. 

First start the additonal service by running `bin/start-additional-service.sh`.

Once it is up and running start the service by running `bin/start-service.sh`.

To find the hostname of the service run `oc get routes demo-service`. Then open `https://<hostname>/public` 
in your favorite browser. You can also try `https://<hostname>/secured`, but this will return a 401 as you
are not authenticated at this point.

## Deploying the HTML5 application

The HTML5 application is a basic web application that is secured with the Keycloak JavaScript adapter.
You can login to the application through Keycloak and then securely invoke the Node.js service.

Simply run `bin/start-app-php.sh` and the application will be deployed to OpenShift.
 
To find the hostname of the service run `oc get routes demo-app`. Then open `https://<hostname>/public` 
in your favorite browser. Click on the login button and login with username `keycloak` and password `test`.
Now you can click on the various buttons to invoke different endpoints on the service.

You won't be able to invoke the admin endpoint at this point as the `keycloak` user doesn't have the required
roles. Login to the Keycloak admin console and add the `admin` role to the `keycloak` user to be able to
do that.

One last fun thing you can try is to change the application to invoke the PHP service instead.


##  Additional things to try


### Keycloak Gatekeeper

The PHP service is a very simple API that is secured with the Keycloak Generic adapter.

Simply run `bin/start-service-php.sh` and the service will be deployed to OpenShift. 

To find the hostname of the service run `oc get routes demo-service-php`. Then open `https://<hostname>/public` 
in your favorite browser. You can also try `https://<hostname>/secured`, but this will return a 401 as you
are not authenticated at this point.

As the PHP service provides the same API as the Node.js service from the basic demo you can configure the HTML5
application to invoke it. To do this run `bin/switch-app-service.sh php`.


### Client Mutual SSL authentication

The Mutual TLS application demonstrates how to use Mutual TLS with x509 Client Authenticator. It should be 
considered as a separate piece from the PHP, Node.js and HTML5 application (although it exposes the same
REST interface). 

In order to run it, just invoke `bin/start-mutual-tls-demo.sh`. The next step is to obtain the route using `oc get routes`.
Once you identify, navigate to the demo application and proceed into the secured section. Both Keycloak and 
Mutual TLS application have SSL debug turned on. This way you will see how the handshake messages are flying in and out.

NOTE: Do not forget to import the `demo-realm.json`! 