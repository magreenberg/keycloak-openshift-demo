#!/bin/bash -e
source bin/env.sh

KEYCLOAK_URL=https://`oc get routes keycloak -o jsonpath='{.spec.host}'`/auth

oc get buildconfigs additional-service &>/dev/null || oc new-build --binary=true --name=additional-service
oc start-build additional-service --from-dir=additional-service --follow

oc new-app -f additional-service/additional-service.json -p KEYCLOAK_URL=$KEYCLOAK_URL
