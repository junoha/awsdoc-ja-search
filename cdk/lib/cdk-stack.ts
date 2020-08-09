import * as cdk from '@aws-cdk/core';
import { CrawlerStack } from './stack/crawler-stack';

export interface AwsDocSearchStackProps extends cdk.StackProps {
  s3BucketName: string,
  s3Prefix: string,
  semaphore: number,
}
export class AwsDocSearchStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: AwsDocSearchStackProps) {
    super(scope, id);

    if (props) {
      // Child stack of crawler
      new CrawlerStack(this, 'CrawlerStack', props);
    }

  }
}
