import * as cdk from '@aws-cdk/core';
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';
import * as ecs from '@aws-cdk/aws-ecs';
import * as iam from '@aws-cdk/aws-iam';
import { AwsDocSearchStackProps } from '../cdk-stack';

export class CrawlerStack extends cdk.NestedStack {
  constructor(scope: cdk.Construct, id: string, props: AwsDocSearchStackProps) {
    super(scope, id);

    // ECR
    const ecrAsset = new DockerImageAsset(this, 'CrawlerImage', {
      directory: '../doc-crawler',
    });

    // IAM role
    const executionRole = new iam.Role(this, 'EcsTaskExecutionRole', {
      roleName: 'ecs-crawler-task-execution-role',
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
      ],
    });

    const taskRole = new iam.Role(this, 'EcsTaskRole', {
      roleName: 'ecs-crawler-task-role',
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3FullAccess')
      ],
    });

    // Fargate
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'CrawlerTaskdef', {
      memoryLimitMiB: 1024,
      cpu: 512,
      executionRole: executionRole,
      taskRole: taskRole,
    });

    taskDefinition.addContainer("Crawler", {
      image: ecs.ContainerImage.fromDockerImageAsset(ecrAsset),
      environment: {
        'BUCKET': props.s3BucketName,
        'PREFIX': props.s3Prefix,
        'SEMAPHORE': props.semaphore.toString(),
      },
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'crawler'
      })
    });

  }
}