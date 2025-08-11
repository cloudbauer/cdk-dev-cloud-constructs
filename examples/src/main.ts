import process from 'node:process';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { Construct } from 'constructs';
import { App, Stack, StackProps, Environment, aws_eks as eks, aws_iam as iam } from 'aws-cdk-lib';
import { GitlabConstruct } from '../../src';
import { EksClusterStackBuilder, PlatformTeamByRole } from '../../stack/src';

interface GitLabStackProps extends StackProps {
  /**
     * Gitlab full qualified domain name
     */
  readonly cluster: eks.ICluster;
  readonly namespace?: string;
  readonly domainName?: string;
}

class GitLabStack extends Stack {
  constructor(scope: Construct, id: string, props: GitLabStackProps) {
    super(scope, id, props);

    const eksCluster = eks.Cluster.fromClusterAttributes(this, `eks-cluster`, {
      clusterName: props.cluster.clusterName,
      clusterSecurityGroupId: props.cluster.clusterSecurityGroupId,
      kubectlRoleArn: props.cluster.kubectlRole?.roleArn,
      clusterEndpoint: props.cluster.clusterEndpoint,
      kubectlLambdaRole: props.cluster.kubectlLambdaRole ,
    });

    // define resources / helm charts here...
    new GitlabConstruct(this, 'gitlab', {
      cluster: eksCluster,
      domainName: props.domainName,
      chartName: 'gitlab',
      chartVersion: '9.1.1',
    });
  }
}


const env: Environment = { region: process.env.CDK_DEFAULT_REGION, account: process.env.CDK_DEFAULT_ACCOUNT };
const app = new App();
const masterRoleProvider = new blueprints.CreateRoleProvider('master-role',
  new iam.ArnPrincipal(`arn:aws:iam::${env.account}:root`),
  [iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
)


// associate the role to a construct node
// Object.defineProperty(role, Symbol.for('constructs.Construct.node'), {
//   value: (role.node as any)._actualNode
// });

//-------------------------------------------
// Single cluster with example configuration.
//-------------------------------------------
const clusterStack = EksClusterStackBuilder.builder({ domainName: 'start.123co.de' })
  .account(env.account)
  .region(env.region)
  .resourceProvider('master-role', masterRoleProvider)
  .teams(new PlatformTeamByRole( `arn:aws:iam::${env.account!}:role/AWSReservedSSO_AWSAdministratorAccess_06b2ee70a910389f` ))
  .build(app, 'example-dev-cluster');

// for examples, use account/region from cdk cli
const serviceStack = new GitLabStack(app, 'example-dev-cloud', {
  env: env,
  cluster: clusterStack.getClusterInfo().cluster,
  domainName: 'start.123co.de',
});

serviceStack.addDependency(clusterStack);

app.synth();
console.log('Service stack is created for account %s', env.account);