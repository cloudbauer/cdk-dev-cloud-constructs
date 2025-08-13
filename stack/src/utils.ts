import process from 'node:process';
import {
  App,
  Stack,
  aws_eks as eks,
  aws_iam as iam
} from 'aws-cdk-lib';
import {
  EksBlueprint,
  BlueprintBuilder,
  GlobalResources,
  ImportClusterProvider,
  VpcProvider,
  HelmAddOn,
  utils
} from '@aws-quickstart/eks-blueprints';
import { Construct } from 'constructs';


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
    readonly vpcId: string;

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
            openIdConnectProvider: props.openIdConnectProviderArn? iam.OpenIdConnectProvider.fromOpenIdConnectProviderArn(scope, id, props.openIdConnectProviderArn): undefined,
            clusterCertificateAuthorityData: props.clusterCertificateAuthorityData,
            kubectlRoleArn: props.kubectlRoleArn,
            clusterSecurityGroupId: props.clusterSecurityGroupId,
            securityGroupIds: props.securityGroupIds
    })

    return EksBlueprint.builder()
      .clusterProvider(importClusterProvider)
      .resourceProvider(GlobalResources.Vpc, new VpcProvider(props.vpcId)) // Important! register cluster VPC
      .account(props.account)
      .region(props.region);
  }
}