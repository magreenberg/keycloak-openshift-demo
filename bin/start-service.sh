#!/bin/bash -e
source bin/env.sh

KEYCLOAK_URL=https://`oc get routes keycloak -o jsonpath='{.spec.host}'`/auth
ADDITIONAL_SERVICE_URL=https://`oc get routes additional-service -o jsonpath='{.spec.host}'`/admin

oc get buildconfigs demo-service &>/dev/null || oc new-build --binary=true --name=demo-service
oc start-build demo-service --from-dir=demo-service --follow

oc new-app -f demo-service/demo-service.json -p KEYCLOAK_URL=$KEYCLOAK_URL -p ADDITIONAL_SERVICE_URL=$ADDITIONAL_SERVICE_URL
#oc process -f demo-service/demo-service.yaml -p KEYCLOAK_URL=$KEYCLOAK_URL -p ADDITIONAL_SERVICE_URL=$ADDITIONAL_SERVICE_URL | oc create -f -
