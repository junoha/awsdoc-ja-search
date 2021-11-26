#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsDocSearchStack } from '../lib/cdk-stack';
import { Tags } from '@aws-cdk/core';

const app = new cdk.App();

const s3BucketName: string = app.node.tryGetContext('s3BucketName') ?? process.env.S3_BUCKET_NAME;;
if (!s3BucketName) {
  console.error('Invalid s3BucketName. s3BucketName must be set');
  process.exit(1);
}

const s3Prefix: string = app.node.tryGetContext('s3Prefix') ?? process.env.S3_PREFIX;;
if (!s3Prefix) {
  console.error('Invalid s3Prefix. s3Prefix must be set');
  process.exit(1);
}

const semaphore: string = app.node.tryGetContext('semaphore') ?? process.env.SEMAPHORE;;
if (!semaphore) {
  console.error('Invalid semaphore. semaphore must be set');
  process.exit(1);
}
if (isNaN(parseInt(semaphore))) {
  console.error('Invalid semaphore. semaphore must be number');
  process.exit(1);
}
const semaphoreInt = parseInt(semaphore);

const snsTopicArn: string = app.node.tryGetContext('snsTopicArn') ?? process.env.SNS_TOPIC_ARN;
if (!snsTopicArn) {
  console.error('snsTopicArn must be set. -c snsTopicArn=yyy or SNS_TOPIC_ARN=yyy');
  process.exit(1);
}

const props = {
  s3BucketName,
  s3Prefix,
  semaphore: semaphoreInt,
  snsTopicArn,
};

const stack = new AwsDocSearchStack(app, 'AwsDocSearchStack', props);
Tags.of(stack).add('auto-delete', 'no', {
  includeResourceTypes: ['AWS::Lambda::Function'],
});
