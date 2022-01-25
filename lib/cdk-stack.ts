import * as cdk from 'aws-cdk-lib';
import { Stack, StackProps,aws_s3 as s3 } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';

const localLB = require('./lb-stack');

export class CdkStack extends Stack {
  public readonly bucketName: string;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new localLB.LoadBalancerStack(this,'LoadBalancerStack');
    
    const bucket = new s3.Bucket(this, 'CdkBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });
    this.bucketName = bucket.bucketName;
    const fn = new lambda.Function(this, 'notificationsLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      functionName: 'lambdaManager',
      handler: 'lambda.main',
      code: lambda.Code.fromAsset('resources'),
      reservedConcurrentExecutions: 1,
      timeout: cdk.Duration.seconds(300),
      environment:{
        BUCKET:bucket.bucketName
      }
    });
    bucket.grantReadWrite(fn);
    fn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['s3:GetBucketNotification', 's3:PutBucketNotification'],
        effect: iam.Effect.ALLOW,
        resources: [ bucket.bucketArn ]
      })
    );
    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'CdkQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
