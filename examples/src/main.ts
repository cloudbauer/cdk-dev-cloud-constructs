import process from 'node:process';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import { Stack, StackProps, CfnOutput, Environment, Fn, aws_iam as iam, App } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { configureApp, ImportClusterBlueprint, ImportClusterBlueprintProps } from '../../stack/src';
import { EksClusterStackBuilder, PlatformTeamByRole } from '../../stack/src';
import { KubectlProvider } from "@aws-quickstart/eks-blueprints/dist/addons/helm-addon/kubectl-provider";

interface GitLabStackProps extends Omit<ImportClusterBlueprintProps & StackProps, "account" | "region" > {
  /**
   * Namespaced in cluster to use for deployment.
   * @default - if not specified, 'default' will be used
   */
  readonly namespace?: string;

  /**
   * The domain name to be used for expose the service endpoint
   * This property is needed.
  */  
  readonly domainName: string;
}

class GitLabStack extends Stack {
  constructor(scope: Construct, id: string, props: GitLabStackProps) {
    super(scope, id, props);

    const gitlabStackBuilder = ImportClusterBlueprint.import(this, 'clusterbuilder', {
      clusterName: props.clusterName,
      kubernetesVersionString: props.kubernetesVersionString,
      vpcId: props.vpcId,
      clusterEndpoint: props.clusterEndpoint,
      openIdConnectProviderArn: props.openIdConnectProviderArn,
      clusterCertificateAuthorityData: props.clusterCertificateAuthorityData,
      kubectlRoleArn: props.kubectlRoleArn,
      clusterSecurityGroupId: props.clusterSecurityGroupId,
      securityGroupIds: props.securityGroupIds,
      account: props.env!.account!,
      region: props.env!.region!,
    })

    const gitlabStack = gitlabStackBuilder.build(this, 'cluster');

    // for examples, use account/region from cdk cli
    KubectlProvider.applyHelmDeployment(gitlabStack.getClusterInfo(), {
      name: 'gitlab',
      namespace: 'default',
      chart: 'gitlab/gitlab',
      repository: 'https://charts.gitlab.io',
      version: '9.1.1',
      release: 'gitlab',
      values: {
        installCertmanager: false,
        global: {
          hosts: {
            domain: domainName,
          },
          email: {
            from: 'gitlab@' + domainName,
            display_name: `GitLab (${domainName})`,
          },
          ingress: {
            configureCertmanager: false,
            annotations: {
              'kubernetes.io/tls-acme': true,
            },
          },
        },
      },
      dependencyMode: false
    });
  }
}

const app = configureApp();
const env: Environment = { region: process.env.CDK_DEFAULT_REGION!, account: process.env.CDK_DEFAULT_ACCOUNT! };

const masterRoleProvider = new blueprints.CreateRoleProvider('master-role',
  new iam.ArnPrincipal(`arn:aws:iam::${env.account}:root`),
  [iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
)
const domainName = 'start.123co.de';

//-------------------------------------------
// Single cluster with example configuration.
//-------------------------------------------
const clusterStack = EksClusterStackBuilder.builder({ domainName: 'start.123co.de' })
  .account(env.account)
  .region(env.region)
  .resourceProvider('master-role', masterRoleProvider)
  .teams(new PlatformTeamByRole( `arn:aws:iam::${env.account!}:role/AWSReservedSSO_AWSAdministratorAccess_06b2ee70a910389f` ))
  .build(app, 'example-dev-cluster');

const cluster = clusterStack.getClusterInfo().cluster;
const version = clusterStack.getClusterInfo().version.version
const securityGroupIds = cluster.connections.securityGroups.map(value => value.securityGroupId).join(' ')

new CfnOutput(clusterStack, 'ClusterName', { value: cluster.clusterName, exportName: clusterStack.stackId + 'ClusterName' });
new CfnOutput(clusterStack, 'KubernetesVersion', { value: version, exportName: clusterStack.stackId + 'KubernetesVersion' });
new CfnOutput(clusterStack, 'VpcId', { value: cluster.vpc.vpcId, exportName: clusterStack.stackId + 'VpcId' });
new CfnOutput(clusterStack, 'ClusterEndpoint', { value: cluster.clusterEndpoint, exportName: clusterStack.stackId + 'ClusterEndpoint' });
new CfnOutput(clusterStack, 'ClusterCertificateAuthorityData', { value: cluster.clusterCertificateAuthorityData, exportName: clusterStack.stackId + 'ClusterCertificateAuthorityData' });
new CfnOutput(clusterStack, 'OpenIdConnectProviderArn', { value: cluster.openIdConnectProvider.openIdConnectProviderArn, exportName: clusterStack.stackId + 'OpenIdConnectProviderArn' });
new CfnOutput(clusterStack, 'KubectlRoleArn', { value: cluster.kubectlRole? cluster.kubectlRole.roleArn: '', exportName: clusterStack.stackId + 'KubectlRoleArn' });
new CfnOutput(clusterStack, 'ClusterSecurityGroupId', { value: cluster.clusterSecurityGroupId, exportName: clusterStack.stackId + 'ClusterSecurityGroupId' });
new CfnOutput(clusterStack, 'SecurityGroupIds', { value: securityGroupIds, exportName: clusterStack.stackId + 'SecurityGroupIds' });

const gitlabStack = new GitLabStack(app, 'example-dev-gitlab', {
  clusterName: Fn.importValue(clusterStack.stackId + 'ClusterName'),
  kubernetesVersionString: Fn.importValue(clusterStack.stackId + 'KubernetesVersion'),
  vpcId: Fn.importValue(clusterStack.stackId + 'VpcId'),
  clusterEndpoint: Fn.importValue(clusterStack.stackId + 'ClusterEndpoint'),
  openIdConnectProviderArn: Fn.importValue(clusterStack.stackId + 'OpenIdConnectProviderArn'),
  clusterCertificateAuthorityData: Fn.importValue(clusterStack.stackId + 'ClusterCertificateAuthorityData'),
  kubectlRoleArn: Fn.importValue(clusterStack.stackId + 'KubectlRoleArn'),
  clusterSecurityGroupId: Fn.importValue(clusterStack.stackId + 'ClusterSecurityGroupId'),
  securityGroupIds: Fn.importValue(clusterStack.stackId + 'SecurityGroupIds').split(' '),
  env: env,
  domainName: 'gitlab.' + domainName,
});

gitlabStack.addDependency(clusterStack);

app.synth();
console.log('Service stack is created for account %s', env.account);