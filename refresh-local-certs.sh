#!/bin/sh

PROJECT_NAME=lafleet
AWS_ACCOUNT_ID_VALUE=$(aws sts get-caller-identity --query "Account" --output text)
S3_OBJECT_STORE=$PROJECT_NAME-object-store-$AWS_ACCOUNT_ID_VALUE

mkdir ./certs
aws s3 cp s3://$S3_OBJECT_STORE/certs/mockIotGpsDeviceAwsSdkV2/certificate-id.txt ./certs
aws s3 cp s3://$S3_OBJECT_STORE/certs/mockIotGpsDeviceAwsSdkV2/certificate.pem.crt ./certs
aws s3 cp s3://$S3_OBJECT_STORE/certs/mockIotGpsDeviceAwsSdkV2/private.pem.key ./certs
aws s3 cp s3://$S3_OBJECT_STORE/certs/mockIotGpsDeviceAwsSdkV2/public.pem.key ./certs
aws s3 cp s3://$S3_OBJECT_STORE/certs/mockIotGpsDeviceAwsSdkV2/root-ca.crt ./certs
