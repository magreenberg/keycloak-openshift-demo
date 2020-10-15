#!/bin/bash -e
source bin/env.sh

oc delete all -l application=demo-service
