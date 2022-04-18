#!/bin/sh

ENV_FILE=$1
export ENDPOINT=$(grep ENDPOINT $ENV_FILE | cut -d '=' -f2)
export TOPIC=$(grep TOPIC $ENV_FILE | cut -d '=' -f2)
export INTERVAL=$(grep INTERVAL $ENV_FILE | cut -d '=' -f2)
export COUNT=$(grep COUNT $ENV_FILE | cut -d '=' -f2)
#export MESSAGE=$(grep MESSAGE $ENV_FILE | cut -d '=' -f2)
#export IDLE=$(grep IDLE $ENV_FILE | cut -d '=' -f2)

#export CLIENT_ID=$(grep CLIENT_ID $ENV_FILE | cut -d '=' -f2)
#export USE_WEBSOCKET=$(grep USE_WEBSOCKET $ENV_FILE | cut -d '=' -f2)
#export SIGNING_REGION=$(grep SIGNING_REGION $ENV_FILE | cut -d '=' -f2)
export CA_FILE=$(grep CA_FILE $ENV_FILE | cut -d '=' -f2)
export CERT_FILE=$(grep CERT_FILE $ENV_FILE | cut -d '=' -f2)
export KEY_FILE=$(grep KEY_FILE $ENV_FILE | cut -d '=' -f2)
#export PROXY_HOST=$(grep PROXY_HOST $ENV_FILE | cut -d '=' -f2)
#export PROXY_PORT=$(grep PROXY_PORT $ENV_FILE | cut -d '=' -f2)
#export VERBOSITY=$(grep VERBOSITY $ENV_FILE | cut -d '=' -f2)


echo dist/main.js ENDPOINT=$ENDPOINT TOPIC=$TOPIC COUNT=$COUNT INTERVAL=$INTERVAL CA_FILE=$CA_FILE CERT_FILE=$CERT_FILE KEY_FILE=$KEY_FILE
node dist/main.js
