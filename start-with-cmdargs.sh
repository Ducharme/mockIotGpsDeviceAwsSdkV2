#!/bin/sh

ENV_FILE=$1
ENDPOINT=$(grep ENDPOINT $ENV_FILE | cut -d '=' -f2)
TOPIC=$(grep TOPIC $ENV_FILE | cut -d '=' -f2)
INTERVAL=$(grep INTERVAL $ENV_FILE | cut -d '=' -f2)
COUNT=$(grep COUNT $ENV_FILE | cut -d '=' -f2)
#MESSAGE=$(grep MESSAGE $ENV_FILE | cut -d '=' -f2)
#IDLE=$(grep IDLE $ENV_FILE | cut -d '=' -f2)

#CLIENT_ID=$(grep CLIENT_ID $ENV_FILE | cut -d '=' -f2)
#USE_WEBSOCKET=$(grep USE_WEBSOCKET $ENV_FILE | cut -d '=' -f2)
#SIGNING_REGION=$(grep SIGNING_REGION $ENV_FILE | cut -d '=' -f2)
CA_FILE=$(grep CA_FILE $ENV_FILE | cut -d '=' -f2)
CERT_FILE=$(grep CERT_FILE $ENV_FILE | cut -d '=' -f2)
KEY_FILE=$(grep KEY_FILE $ENV_FILE | cut -d '=' -f2)
#PROXY_HOST=$(grep PROXY_HOST $ENV_FILE | cut -d '=' -f2)
#PROXY_PORT=$(grep PROXY_PORT $ENV_FILE | cut -d '=' -f2)
#VERBOSITY=$(grep VERBOSITY $ENV_FILE | cut -d '=' -f2)


# --idle $IDLE --use_websocket $USE_WEBSOCKET --signing_region $SIGNING_REGION
# --proxy_host $PROXY_HOST --proxy_port $PROXY_PORT --verbosity $VERBOSITY
echo dist/main.js --endpoint $ENDPOINT --topic $TOPIC --count $COUNT --interval $INTERVAL --ca_file $CA_FILE --cert_file $CERT_FILE --key_file $KEY_FILE
node dist/main.js --endpoint $ENDPOINT --topic $TOPIC --count $COUNT --interval $INTERVAL --ca_file $CA_FILE --cert_file $CERT_FILE --key_file $KEY_FILE
