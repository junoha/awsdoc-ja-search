import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as iam from '@aws-cdk/aws-iam';
import { Schedule } from '@aws-cdk/aws-events';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sfn from '@aws-cdk/aws-stepfunctions';
import * as sfn_tasks from '@aws-cdk/aws-stepfunctions-tasks';
import { EventsRuleToStepFunction } from '@aws-solutions-constructs/aws-events-rule-step-function';

import { CrawlerStack } from './stack/crawler-stack';
import { IndexerStack } from './stack/indexer-stack';

export interface AwsDocSearchStackProps extends cdk.StackProps {
  s3BucketName: string,
  s3Prefix: string,
  semaphore: number,
}
export class AwsDocSearchStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: AwsDocSearchStackProps) {
    super(scope, id);

    if (props) {
      /**
       * Nested stacks
       */
      const cluster = new ecs.Cluster(this, 'AwsDocSearchCluster');
      const crawlerStack = new CrawlerStack(this, 'CrawlerStack', props);
      const indexerStack = new IndexerStack(this, 'IndexerStack', props);

      /**
       * Get SSM Parameter Lambda function
       */
      const lambdaRole = new iam.Role(this, 'GetParameterStoreLambdaRole', {
        roleName: 'get-ssm-param-lambda-role',
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'),
          iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMReadOnlyAccess'),
        ],
      });

      const getParameterFunc = new lambda.Function(this, 'GetParameterStoreHandler', {
        runtime: lambda.Runtime.NODEJS_12_X,
        code: lambda.Code.fromAsset('lambda'),
        handler: 'getParameter.handler',
        role: lambdaRole,
      });

      /**
       * Step Functions
       */
      const crawlerTaskState = new sfn_tasks.EcsRunTask(this, 'CrawlerTaskState', {
        integrationPattern: sfn.IntegrationPattern.RUN_JOB,
        cluster: cluster,
        taskDefinition: crawlerStack.taskDefinition,
        launchTarget: new sfn_tasks.EcsFargateLaunchTarget(),
      });

      const indexerTaskState = new sfn_tasks.EcsRunTask(this, 'IndexerTaskState', {
        integrationPattern: sfn.IntegrationPattern.RUN_JOB,
        cluster: cluster,
        taskDefinition: indexerStack.taskDefinition,
        launchTarget: new sfn_tasks.EcsFargateLaunchTarget(),
        containerOverrides: [{
          containerDefinition: indexerStack.containerDefinition,
          environment: [
            { name: 'BUCKET', value: sfn.JsonPath.stringAt('$.BUCKET') },
            { name: 'PREFIX', value: sfn.JsonPath.stringAt('$.PREFIX') },
            { name: 'TIMESTAMP', value: sfn.JsonPath.stringAt('$.TIMESTAMP') },
            { name: 'APPLICATION_ID', value: sfn.JsonPath.stringAt('$.APPLICATION_ID') },
            { name: 'ADMIN_API_KEY', value: sfn.JsonPath.stringAt('$.ADMIN_API_KEY') },
            { name: 'INDEX_NAME', value: sfn.JsonPath.stringAt('$.INDEX_NAME') },
          ]
        }]
      });

      const getParameterFuncState = new sfn.Task(this, 'GetParameterState', {
        task: new sfn_tasks.InvokeFunction(lambda.Function.fromFunctionArn(this, 'getParameterState', getParameterFunc.functionArn)),
      });

      const chain = sfn.Chain
        .start(crawlerTaskState)
        .next(getParameterFuncState)
        .next(indexerTaskState);

      new EventsRuleToStepFunction(this, 'AwsDocSearchCron', {
        stateMachineProps: {
          definition: chain
        },
        eventRuleProps: {
          schedule: Schedule.expression('cron(0 18 * * ? *)')
        }
      });
    }

  }
}
