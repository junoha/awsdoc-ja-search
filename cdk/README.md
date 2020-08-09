# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template


## Deploy
This package has two stacks. Root stack is `AwsDocSearchStack`.
```shell
$ cdk list -c s3BucketName=foo -c s3Prefix=bar -c semaphore=30
AwsDocSearchStack
AwsDocSearchStackDocCrawlerStackEE622384
```

Deploy with CDK.
```shell
$ cdk deploy AwsDocSearchStack -c s3BucketName=<s3 bucket> -c s3Prefix=<s3 prefix> -c semaphore=<semaphore>

# example
$ cdk deploy AwsDocSearchStack -c s3BucketName=aws-ohajun-work -c s3Prefix=misc/awsdoc-ja-search -c semaphore=20
```

One shot run Task
```shell
$ aws ecs run-task \
--region ${AWS_DEFAULT_REGION} \
--launch-type FARGATE \
--network-configuration "awsvpcConfiguration={subnets=[${SUBNET_ID}],securityGroups=[${SECURITY_GROUP_ID}],assignPublicIp=ENABLED}" \
--task-definition ${TASK_NAME}
```
