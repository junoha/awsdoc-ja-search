import * as cdk from '@aws-cdk/core';
import { DockerImageAsset } from '@aws-cdk/aws-ecr-assets';
import * as ecs from '@aws-cdk/aws-ecs';
import * as iam from '@aws-cdk/aws-iam';
import { AwsDocSearchStackProps } from '../cdk-stack';

export class IndexerStack extends cdk.NestedStack {

  taskDefinition: ecs.FargateTaskDefinition;
  containerDefinition: ecs.ContainerDefinition;

  constructor(scope: cdk.Construct, id: string, props: AwsDocSearchStackProps) {
    super(scope, id);

    // ECR
    const ecrAsset = new DockerImageAsset(this, 'IndexerImage', {
      directory: '../doc-indexer',
      repositoryName: 'awsdocsearch/indexer'
    });

    // IAM role
    const executionRole = new iam.Role(this, 'EcsTaskExecutionRole', {
      roleName: 'ecs-indexer-task-execution-role',
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
      ],
    });

    const taskRole = new iam.Role(this, 'EcsTaskRole', {
      roleName: 'ecs-indexer-task-role',
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess')
      ],
      inlinePolicies: {
        'docIndexerPolicy': new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                's3:Put*',
                'ssm:GetParameter',
                'ssm:PutParameter'
              ],
              resources: ['*']
            })
          ]
        })
      }
    });    
    // Fargate
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'IndexerTaskdef', {
      memoryLimitMiB: 2048,
      cpu: 512,
      executionRole: executionRole,
      taskRole: taskRole,
    });

    const containerDefinition = taskDefinition.addContainer("Indexer", {
      image: ecs.ContainerImage.fromDockerImageAsset(ecrAsset),
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'awsdocsearch'
      })
    });
    this.containerDefinition = containerDefinition;
    this.taskDefinition = taskDefinition;
  }
}