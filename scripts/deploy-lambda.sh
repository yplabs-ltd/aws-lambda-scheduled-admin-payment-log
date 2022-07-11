#!/usr/env bash 

set -x -e 


export S3_BUCKET_FOR_DEPLOY_LAMBDA=yplabs-lambda-test-bucket


echo "get lambda function alias"
aws lambda get-alias \
  --function-name $DEPOY_FUNCTION_NAME \
  --name $DEPLOY_ALIAS_NAME \
  > lambda-alias.json

export DEVELOPMENT_ALIAS=$(cat lambda-alias.json | jq -r '.FunctionVersion')


echo "zip code"
zip -r lambda_application.zip .


echo "deploy to lambda"
aws lambda update-function-code \
    --function-name $DEPOY_FUNCTION_NAME \
    --zip-file fileb://lambda_application.zip \
    --publish \
    > update-output.json

LATEST_VERSION=$(cat update-output.json | jq -r '.Version')
export DEPLOY_APPSPEC_FILE="$LATEST_VERSION.txt"
if [[ $DEPLOY_ALIAS_NAME -ge $LATEST_VERSION ]]; then
  exit 0
fi


echo "Create appspec file in s3 bucket to create a deployment for CodeDeploy"
cat > $DEPLOY_APPSPEC_FILE <<- EOM
version: 0.0
Resources:
   - ScheduledAdminPaymentLogJob:
      Type: AWS::Lambda::Function
      Properties:
        Name: "$DEPOY_FUNCTION_NAME"
        Alias: "$DEPLOY_ALIAS_NAME"
        CurrentVersion: "$DEVELOPMENT_ALIAS_VERSION"
        TargetVersion: "$LATEST_VERSION"
EOM

aws s3 cp $DEPLOY_APPSPEC_FILE \
    s3://$S3_BUCKET_FOR_DEPLOY_LAMBDA/$DEPLOY_APPSPEC_FILE

REVISION=revisionType=S3.s3Location={
    bucket=$S3_BUCKET_FOR_DEPLOY_LAMBDA,
    key=$DEPLOY_APPSPEC_FILE,
    bundleType=yaml}
