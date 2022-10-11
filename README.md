TypeScript device from AWS code

# Steps to test

Create a .env.production file based on .env.example or .env.production.example (only ENDPOINT has to be edited inside the file)

Update the local certificates with
```
sh ./refresh-local-certs.sh
```

Build the docker image
```
docker build --tag mock-iot-gps-device-awssdkv2:v0.02 .
```

Spawn the docker copntainer
```
docker run -it -p 8884:8883 -m 20M mock-iot-gps-device-awssdkv2:v0.02 --endpoint example-ats.iot.us-east-1.amazonaws.com --streamingLocationTopic lafleet/devices/location/+/streaming --streamIdRequestTopic $STREAMID_REQUEST_TOPIC --streamIdReplyTopic $STREAMID_REPLY_TOPIC --interval 1000 --count 5 --cert_file /home/user/certs/certificate.pem.crt --key_file /home/user/certs/private.pem.key
```

## Playing around

Useful commands
```
npm start --idle true
docker run --env IDLE=true -t mock-iot-gps-device-awssdkv2:v0.02
docker run --detach --rm --env IDLE=true
```

# Useful Documentation

* [AWS IoT Core - MQTT](https://docs.aws.amazon.com/iot/latest/developerguide/mqtt.html)
* [AWS IoT Core - Device communication protocols](https://docs.aws.amazon.com/iot/latest/developerguide/protocols.html)
