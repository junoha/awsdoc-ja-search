import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import { AwsDocSearchStackProps } from '../cdk-stack';
export declare class IndexerStack extends cdk.NestedStack {
    taskDefinition: ecs.FargateTaskDefinition;
    containerDefinition: ecs.ContainerDefinition;
    constructor(scope: cdk.Construct, id: string, props: AwsDocSearchStackProps);
}
