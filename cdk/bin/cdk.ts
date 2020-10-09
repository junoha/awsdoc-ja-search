#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { AwsDocSearchStack } from '../lib/cdk-stack';

const app = new cdk.App();

const s3BucketName: string = app.node.tryGetContext('s3BucketName');
if (!s3BucketName) {
  console.warn('Invalid s3BucketName. s3BucketName must be set');
  process.exit(1);
}

const s3Prefix: string = app.node.tryGetContext('s3Prefix');
if (!s3Prefix) {
  console.warn('Invalid s3Prefix. s3Prefix must be set');
  process.exit(1);
}

const semaphore: string = app.node.tryGetContext('semaphore');
if (!semaphore) {
  console.warn('Invalid semaphore. semaphore must be set');
  process.exit(1);
}
if (isNaN(parseInt(semaphore))) {
  console.warn('Invalid semaphore. semaphore must be number');
  process.exit(1);
}
const semaphoreInt = parseInt(semaphore);

const props = {
  s3BucketName,
  s3Prefix,
  semaphore: semaphoreInt
};

const stack = new AwsDocSearchStack(app, 'AwsDocSearchStack', props);
cdk.Tag.add(stack,'auto-delete','no', {
  includeResourceTypes: ['AWS::Lambda::Function'],
});
