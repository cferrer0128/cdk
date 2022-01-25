import autoscaling = require('aws-cdk-lib/aws-autoscaling');
import ec2 = require('aws-cdk-lib/aws-ec2');
import elbv2 = require('aws-cdk-lib/aws-elasticloadbalancingv2');
import cdk = require('aws-cdk-lib');

import { Stack, StackProps} from 'aws-cdk-lib';
import { Construct } from 'constructs';
export class LoadBalancerStack extends Stack {
    public readonly bucketName: string;
    constructor(scope: Construct, id: string, props?: StackProps) {
      super(scope, id, props);
    
      const vpc = new ec2.Vpc(this, 'VPC');

      const asg = new autoscaling.AutoScalingGroup(this, 'ASG', {
        vpc,
        instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MICRO),
        machineImage: new ec2.AmazonLinuxImage(),
      });
      
      const lb = new elbv2.ApplicationLoadBalancer(this, 'LB', {
        vpc,
        internetFacing: true
      });
      const listener = lb.addListener('Listener', {
        port: 80,
      });
      listener.addTargets('Target', {
        port: 80,
        targets: [asg]
      });
      listener.connections.allowDefaultPortFromAnyIpv4('Open to the world');
      asg.scaleOnRequestCount('AModestLoad', {
        targetRequestsPerMinute: 60,
      });
    
    }

   

}