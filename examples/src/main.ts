import process from 'node:process';
import { Stack, StackProps, Environment, Fn, aws_iam as iam, aws_ec2 as ec2 } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { configureApp, CreateClusterBlueprint, ImportClusterBlueprint, ImportClusterBlueprintProps } from '../../stack/src';
import { KubectlProvider } from "@aws-quickstart/eks-blueprints/dist/addons/helm-addon/kubectl-provider";
import { KubernetesVersion } from 'aws-cdk-lib/aws-eks';

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
      vpc: props.vpc,
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
            domain: props.domainName,
          },
          email: {
            from: 'gitlab@' + props.domainName,
            display_name: `GitLab (${props.domainName})`,
          },
          ingress: {
            configureCertmanager: false,
            annotations: {
              'kubernetes.io/tls-acme': true,
            },
          },
        },
      },
      dependencyMode: true
    });
  }
}

const app = configureApp();
const env: Environment = { region: process.env.CDK_DEFAULT_REGION!, account: process.env.CDK_DEFAULT_ACCOUNT! };
const domainName = 'start.123co.de';

//-------------------------------------------
// Single cluster with example configuration.
//-------------------------------------------
const clusterStack = CreateClusterBlueprint.create(
  { domainName: domainName,
    masterRoleName: 'AWSReservedSSO_AWSAdministratorAccess_06b2ee70a910389f' },
  { env: env })
  .version(KubernetesVersion.of('1.32'))
  .build(app, 'example-dev-cluster', { env: env })

// const clusterStack = new ClusterStack(app, 'example-dev-cluster', {
//   env: env,
//   domainName: domainName,
//   masterRoleName: 'AWSReservedSSO_AWSAdministratorAccess_06b2ee70a910389f'
// });

const gitlabStack = new GitLabStack(app, 'example-dev-gitlab', {
  clusterName: Fn.importValue(clusterStack.stackId + 'ClusterName'),
  kubernetesVersionString: Fn.importValue(clusterStack.stackId + 'KubernetesVersion'),
  vpc: clusterStack.outputProps.vpc, // Fn.importValue(clusterStack.stackId + 'VpcId'),
  clusterEndpoint: Fn.importValue(clusterStack.stackId + 'ClusterEndpoint'),
  openIdConnectProviderArn: Fn.importValue(clusterStack.stackId + 'OpenIdConnectProviderArn'),
  clusterCertificateAuthorityData: clusterStack.outputProps.clusterCertificateAuthorityData,
  kubectlRoleArn: Fn.importValue(clusterStack.stackId + 'KubectlRoleArn'),
  clusterSecurityGroupId: Fn.importValue(clusterStack.stackId + 'ClusterSecurityGroupId'),
  securityGroupIds: Fn.importValue(clusterStack.stackId + 'SecurityGroupIds').split(' '),
  env: env,
  domainName: 'gitlab.' + domainName,
});

gitlabStack.addDependency(clusterStack);

app.synth();
console.log('Service stack is created for account %s', env.account);