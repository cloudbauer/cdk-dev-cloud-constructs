import process from 'node:process';
import { CreateRoleProvider } from '@aws-quickstart/eks-blueprints';
import { Construct } from 'constructs';
import { App, Stack, StackProps, aws_eks as eks, aws_iam as iam } from 'aws-cdk-lib';
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

    // define resources / helm charts here...
    new GitlabConstruct(this, 'gitlab', {
      cluster: props.cluster,
      domainName: props.domainName,
      chartName: 'gitlab',
      chartVersion: '9.1.1',
    });
  }
}

const env = { region: process.env.CDK_DEFAULT_REGION!, account: process.env.CDK_DEFAULT_ACCOUNT! };
const app = new App({ context: { region: env.region, account: env.account } });

//-------------------------------------------
// Single cluster with custom configuration.
//-------------------------------------------
// build AWS EKS cluster with karpenter, logging and more defaults
const clusterStack = EksClusterStackBuilder.builder({ domainName: 'start.123co.de' })
  .account(env.account)
  .region(env.region)
  .resourceProvider('master-role',
    new CreateRoleProvider('master-role',
      new iam.ArnPrincipal(`arn:aws:iam::${env.account}:root`),
      [iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
    ))
  .teams(new PlatformTeamByRole( `arn:aws:iam::${env.account!}:role/AWSReservedSSO_AWSAdministratorAccess_06b2ee70a910389f` ))
  .build(app, 'subito-dev-cloud-cluster');

// for development, use account/region from cdk cli
const serviceStack = new GitLabStack(app, 'subito-dev-cloud-start', {
  env: env,
  cluster: clusterStack.getClusterInfo().cluster,
  domainName: 'start.123co.de',
});

app.synth();
console.log('Service stack is created for account %s', serviceStack.account);