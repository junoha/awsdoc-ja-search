import * as cdk from '@aws-cdk/core';
export interface AwsDocSearchStackProps extends cdk.StackProps {
    s3BucketName: string;
    s3Prefix: string;
    semaphore: number;
    snsTopicArn: string;
}
export declare class AwsDocSearchStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: AwsDocSearchStackProps);
}
