#!/bin/bash -e
source bin/env.sh

KEYCLOAK_POD=`oc get pod --no-headers=true -l application=keycloak -o name | sed 's/pod\///'`
KCADMIN="oc rsh $KEYCLOAK_POD /opt/jboss/keycloak/bin/kcadm.sh"

$KCADMIN config credentials --config /tmp/.kcadmin.config --server http://localhost:8080/auth --realm master --user admin --password admin

$KCADMIN get --config /tmp/.kcadmin.config realms/demo --fields realm &>/dev/null && $KCADMIN delete --config /tmp/.kcadmin.config realms/demo

cat demo-realm.json | $KCADMIN create realms --config /tmp/.kcadmin.config -f -