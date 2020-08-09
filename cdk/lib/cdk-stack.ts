import * as cdk from '@aws-cdk/core';
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';
import * as ecs from '@aws-cdk/aws-ecs';
import * as iam from '@aws-cdk/aws-iam';

export class AwsDocSearchStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ECR
    const ecrAsset = new DockerImageAsset(this, 'CrawlerImage', {
      directory: '../doc-crawler',
      repositoryName: 'awsdocsearch/doc-crawler',
    });

    // IAM role
    const executionRole = new iam.Role(this, 'EcsTaskExecutionRole', {
      roleName: 'ecs-crawler-task-execution-role',
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
      ],
    });

    const taskRole = new iam.Role(this, 'EcsServiceTaskRole', {
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
      image: ecs.ContainerImage.fromEcrRepository(ecrAsset.repository, ecrAsset.imageUri)
    });

  }
}
