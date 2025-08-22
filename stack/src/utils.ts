import process from 'node:process';
import {
  EksBlueprint,
  EksBlueprintProps,
  BlueprintBuilder,
  GlobalResources,
  CreateRoleProvider,
  ImportClusterProvider,
  DirectVpcProvider,
  HelmAddOn,
  utils,
  AwsLoadBalancerControllerAddOn,
  VpcCniAddOn,
  KubeProxyAddOn,
  EbsCsiDriverAddOn,
  CertManagerAddOn,
  KarpenterV1AddOn,
  MetricsServerAddOn,
  ExternalDnsAddOn,
  LookupHostedZoneProvider,
} from '@aws-quickstart/eks-blueprints';
import {
  App,
  Stack,
  StackProps,
  CfnOutput,
  aws_ec2 as ec2,
  aws_eks as eks,
  aws_iam as iam,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { PlatformTeamByRole } from './';
import { GitLabAddOn, GitLabServiceType } from './gitlabaddon';


export function errorHandler(app: App, message: string, error?: Error) {
  utils.logger.info(message);
  if (error) {
    utils.logger.error(error.name, error.message, error.stack);
  }
  new EmptyStack(app);
}

export function configureApp(logLevel? : number): App {
  utils.logger.settings.minLevel = logLevel ?? 2; // debug., 3 info
  utils.logger.settings.hideLogPositionForProduction = true;
  utils.userLog.info('=== Run make compile before each run, if any code modification was made. === \n\n');

  const account = process.env.CDK_DEFAULT_ACCOUNT!;
  const region = process.env.CDK_DEFAULT_REGION!;

  HelmAddOn.validateHelmVersions = true;

  return new App({ context: { account, region } });
}

export class EmptyStack extends Stack {
  constructor(scope: App, ...message: string[]) {
    super(scope, 'empty-error-stack');
    if (message) {
      message.forEach(m => utils.logger.info(m));
    }
  }
}

export interface CreateClusterBuilderProps {
  /**
   * The domain name to be used for expose the service endpoint
   * This property is needed.
  */
  domainName: string;
  masterRoleName: string;
}

export interface CreateClusterBlueprintProps extends EksBlueprintProps, Partial<CreateClusterBuilderProps> {}

export interface ClusterStackOutputProps extends StackProps {
  readonly domainName: string;
  readonly clusterName: string;
  readonly kubernetesVersion: string;
  readonly vpc: ec2.IVpc;
  readonly clusterEndpoint: string;
  readonly clusterCertificateAuthorityData: string;
  readonly openIdConnectProviderArn: string;
  readonly kubectlRoleArn?: string;
  readonly clusterSecurityGroupId: string;
  readonly securityGroupIds: string[];
}

export class CreateClusterBlueprint extends EksBlueprint {
  static create(blueprintProps: CreateClusterBuilderProps, props?: StackProps) : CreateClusterBlueprintBuilder {
    const masterRoleProvider = new CreateRoleProvider('master-role',
      new iam.AccountRootPrincipal(),
      [iam.ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')],
    );

    const hostedZone = new LookupHostedZoneProvider(blueprintProps.domainName);

    return CreateClusterBlueprint.builder()
      .account(props?.env?.account)
      .region(props?.env?.region)
      .domainName(blueprintProps.domainName)
      .resourceProvider('master-role', masterRoleProvider)
      .resourceProvider(GlobalResources.HostedZone, hostedZone)
      .teams(new PlatformTeamByRole( { name: 'platform', platformTeamRoleName: blueprintProps.masterRoleName } ))
      .addOns(
        new AwsLoadBalancerControllerAddOn,
        new VpcCniAddOn,
        new KubeProxyAddOn,
        new EbsCsiDriverAddOn,
        new MetricsServerAddOn,
        new KarpenterV1AddOn,
        new ExternalDnsAddOn({ hostedZoneResources: [GlobalResources.HostedZone] }),
        new CertManagerAddOn({
          namespace: 'default',
        }),
        new GitLabAddOn({
          namespace: 'default',
          serviceType: GitLabServiceType.ALB,
          ingressHost: blueprintProps.domainName,
        }),
      );
  }

  static builder(): CreateClusterBlueprintBuilder {
    return new CreateClusterBlueprintBuilder();
  }

  readonly outputProps: ClusterStackOutputProps;

  constructor(scope: Construct, blueprintProps: CreateClusterBlueprintProps, props?: StackProps) {
    super(scope, blueprintProps, props);

    const cluster = this.getClusterInfo().cluster;
    const version = this.getClusterInfo().version.version;
    const securityGroupIds = cluster.connections.securityGroups.map(value => value.securityGroupId);

    new CfnOutput(this, 'ClusterName', { value: cluster.clusterName, exportName: 'ClusterName' });
    new CfnOutput(this, 'KubernetesVersion', { value: version, exportName: 'KubernetesVersion' });
    new CfnOutput(this, 'VpcId', { value: cluster.vpc.vpcId, exportName: 'VpcId' });
    new CfnOutput(this, 'ClusterEndpoint', { value: cluster.clusterEndpoint, exportName: 'ClusterEndpoint' });
    // new CfnOutput(this, 'ClusterCertificateAuthorityData', { value: cluster.clusterCertificateAuthorityData, exportName: 'ClusterCertificateAuthorityData' });  CREATE_FAILED Max length of 1024 exceeded
    new CfnOutput(this, 'OpenIdConnectProviderArn', { value: cluster.openIdConnectProvider.openIdConnectProviderArn, exportName: 'OpenIdConnectProviderArn' });
    new CfnOutput(this, 'KubectlRoleArn', { value: cluster.kubectlRole? cluster.kubectlRole.roleArn: '', exportName: 'KubectlRoleArn' });
    new CfnOutput(this, 'ClusterSecurityGroupId', { value: cluster.clusterSecurityGroupId, exportName: 'ClusterSecurityGroupId' });
    new CfnOutput(this, 'SecurityGroupIds', { value: securityGroupIds.join(' '), exportName: 'SecurityGroupIds' });

    this.outputProps = {
      description: props?.description,
      env: props?.env,
      stackName: props?.stackName,
      tags: props?.tags,
      notificationArns: props?.notificationArns,
      synthesizer: props?.synthesizer,
      terminationProtection: props?.terminationProtection,
      analyticsReporting: props?.analyticsReporting,
      crossRegionReferences: props?.crossRegionReferences,
      permissionsBoundary: props?.permissionsBoundary,
      suppressTemplateIndentation: props?.suppressTemplateIndentation,
      propertyInjectors: props?.propertyInjectors,
      domainName: blueprintProps.domainName ?? '',
      clusterName: cluster.clusterName,
      kubernetesVersion: version,
      vpc: cluster.vpc,
      clusterEndpoint: cluster.clusterEndpoint,
      clusterCertificateAuthorityData: cluster.clusterCertificateAuthorityData,
      openIdConnectProviderArn: cluster.openIdConnectProvider.openIdConnectProviderArn,
      kubectlRoleArn: cluster.kubectlRole?.roleArn,
      clusterSecurityGroupId: cluster.clusterSecurityGroupId,
      securityGroupIds: securityGroupIds,
    };
  }

  /**
   * Since constructor cannot be marked as async, adding a separate method to wait
   * for async code to finish.
   * @returns Promise that resolves to the blueprint
   */
  public async waitForAsyncTasks(): Promise<CreateClusterBlueprint> {
    return super.waitForAsyncTasks().then(() => {
      return this;
    });
  }
}
// 149:5  error  Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator  @typescript-eslint/no-floating-promises


/**
 * Needed to handle CreateClusterBlueprint extension
 * inherents
 * clone(region?: string, account?: string): BlueprintBuilder;
 * build(scope: Construct, id: string, stackProps?: cdk.StackProps): EksBlueprint;
 * compatibilityMode(compatibilityMode: boolean): BlueprintBuilder;
 * buildAsync(scope: Construct, id: string, stackProps?: cdk.StackProps): Promise<EksBlueprint>;
*/
export class CreateClusterBlueprintBuilder extends BlueprintBuilder {
  builderProps: Partial<CreateClusterBuilderProps>;

  constructor() {
    super();
    this.builderProps = {};
  }

  public domainName(domainName?: string): this {
    this.builderProps.domainName = domainName;
    return this;
  }

  public clone(region?: string, account?: string): CreateClusterBlueprintBuilder {
    return new CreateClusterBlueprintBuilder().withBlueprintProps(this.props)
      .account(account ?? this.env.account).region(region ?? this.env.region);
  }
  public build(scope: Construct, id: string, stackProps?: StackProps): CreateClusterBlueprint {
    return new CreateClusterBlueprint(scope, { ...this.props, ...this.builderProps, ...{ id } },
      { ...{ env: this.env }, ...stackProps });
  }

  /**
     * Sets compatibility mode
     * @param compatibilityMode if true will attach blueprints resources directly to the stack.
     * @returns
     */
  public compatibilityMode(compatibilityMode: boolean): CreateClusterBlueprintBuilder {
    this.props = { ...this.props, ...{ compatibilityMode } };
    return this;
  }

  public async buildAsync(scope: Construct, id: string, stackProps?: StackProps): Promise<CreateClusterBlueprint> {
    return this.build(scope, id, stackProps).waitForAsyncTasks();
  }
}

/**
 * Properties object for the ImportClusterProvider.
 */
export interface ImportClusterBlueprintProps {
  /**
     * The physical name of the Cluster
     */
  readonly clusterName: string;

  /**
     * The AWS Account ID of the Cluster
     */
  readonly account: string;

  /**
     * The region of the Cluster
     */
  readonly region: string;

  /**
     * The VPC Id of the Cluster
     */
  readonly vpc: ec2.IVpc;

  /**
     * The API Server endpoint URL
     * @default - if not specified `cluster.clusterEndpoint` will throw an error.
     */
  readonly clusterEndpoint?: string;

  /**
     * An Open ID Connect provider for this cluster that can be used to configure service accounts.
     * You can either import an existing provider using `iam.OpenIdConnectProvider.fromProviderArn`,
     * or create a new provider using `new eks.OpenIdConnectProvider`
     * @default - if not specified `cluster.openIdConnectProvider` and `cluster.addServiceAccount` will throw an error.
     */
  readonly openIdConnectProviderArn?: string;

  /**
     * The certificate-authority-data for your cluster.
     * @default - if not specified `cluster.clusterCertificateAuthorityData` will
     * throw an error
     */
  readonly clusterCertificateAuthorityData?: string;
  /**
     * The cluster security group that was created by Amazon EKS for the cluster.
     * @default - if not specified `cluster.clusterSecurityGroupId` will throw an
     * error
     */
  readonly clusterSecurityGroupId?: string;
  /**
     * An IAM role with cluster administrator and "system:masters" permissions.
     * @default - if not specified, it not be possible to issue `kubectl` commands
     * against an imported cluster.
     */
  readonly kubectlRoleArn?: string;
  /**
     * Additional security groups associated with this cluster.
     * @default - if not specified, no additional security groups will be
     * considered in `cluster.connections`.
     */
  readonly securityGroupIds?: string[];

  /**
     * The Kubernetes version to run in the cluster
     * This property is needed as it drives selection of certain add-on versions as well as kubectl layer.
    */
  readonly kubernetesVersionString: string;
}

export class ImportClusterBlueprint extends EksBlueprint {
  static import(scope: Construct, id: string, props: ImportClusterBlueprintProps) : BlueprintBuilder {
    const importClusterProvider = new ImportClusterProvider({
      clusterName: props.clusterName,
      version: eks.KubernetesVersion.of(props.kubernetesVersionString),
      clusterEndpoint: props.clusterEndpoint,
      openIdConnectProvider:
        props.openIdConnectProviderArn?
          iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(scope, id, props.openIdConnectProviderArn):
          undefined,
      clusterCertificateAuthorityData: props.clusterCertificateAuthorityData,
      kubectlRoleArn: props.kubectlRoleArn,
      clusterSecurityGroupId: props.clusterSecurityGroupId,
      securityGroupIds: props.securityGroupIds,
    });

    return EksBlueprint.builder()
      .clusterProvider(importClusterProvider)
      .resourceProvider(GlobalResources.Vpc, new DirectVpcProvider(props.vpc)) // Important! register cluster VPC
      .account(props.account)
      .region(props.region);
  };

  constructor(scope: Construct, blueprintProps: EksBlueprintProps, props?: StackProps) {
    super(scope, blueprintProps, props);
  };
}
