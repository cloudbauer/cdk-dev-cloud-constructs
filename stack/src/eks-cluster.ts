import 'source-map-support/register';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eks from 'aws-cdk-lib/aws-eks';
import { ArnPrincipal } from 'aws-cdk-lib/aws-iam';
import { merge } from 'ts-deepmerge';


const DEFAULT_K8S_VERSION = '1.32';
const DEFAULT_NODES_INSTANCE_CLASSES = [ec2.InstanceClass.T3];
const DEFAULT_NODES_INSTANCE_SIZES =[ec2.InstanceSize.MEDIUM, ec2.InstanceSize.LARGE];

// Team implementations
export class TeamPlatform extends blueprints.teams.PlatformTeam {
  constructor(accountID: string) {
    super({
      name: 'platform',
      users: [new ArnPrincipal(`arn:aws:iam::${accountID}:user/superadmin`)],
    });
  }
}

/**
 * Options for the EksClusterStackBuilder builder() constructor
 */
export interface EksClusterOptions {
  /**
   * Cluster services base domain name
   */
  readonly domainName: string;

  /**
   * Optional, Kubernetes version to use for the cluster.
   */
  kubernetesVersion?: eks.KubernetesVersion;
  /**
   * Optional, Instance class to use for the cluster.
   */
  instanceClasses?: ec2.InstanceClass[];
  /**
   * Optional, Instance size to use for the cluster.
   */
  instanceSizes?: ec2.InstanceSize[];
  /**
   * Optional, Desired number of nodes to use for the cluster.
   */
  desiredNodeSize?: number;
  /**
   * Optional, Minimum number of nodes to use for the cluster.
   */
  minNodeSize?: number;
  /**
   * Optional, Maximum number of nodes to use for the cluster.
   */
  maxNodeSize?: number;
  /**
   * Optional, Minimum number of spot nodes to use additionally for the cluster.
   */
  minSpotNodeSize?: number;
  /**
   * Optional, Block device size.
   */

  blockDeviceSize?: number;
  /**
   * Optional, Cluster Provider Tags.
   */
  clusterProviderTags?: {
    [key: string]: string;
  };

  /**
   * Optional, Node Group Tags for AL2 nodes
   * which run standard cluster software.
   */
  nodeGroupTags?: {
    [key: string]: string;
  };
}

/**
 * Default values to be used when creating the EKS cluster
 */
const defaultOptions: EksClusterOptions = {
  domainName: 'undefined.com',
  kubernetesVersion: eks.KubernetesVersion.of(DEFAULT_K8S_VERSION),
  instanceClasses: DEFAULT_NODES_INSTANCE_CLASSES,
  instanceSizes: DEFAULT_NODES_INSTANCE_SIZES,
  desiredNodeSize: 2,
  minNodeSize: 2,
  maxNodeSize: 6,
  minSpotNodeSize: 2,
  blockDeviceSize: 50,
  clusterProviderTags: {
    Name: 'blueprints-bottlerock-eks-cluster',
    Type: 'generic-bottlerock-cluster',
  },
  nodeGroupTags: {
    Name: 'Mng-linux-bottlerock',
    Type: 'Managed-linux-bottlerock-node-Group',
    LaunchTemplate: 'Linux-Launch-Template',
  },
};

/**
 * Leverage EKS cluster optimized for running all dev-cloud Constructs like Gitlab, Jenkins and Sonar
 */

export class EksClusterStackBuilder extends blueprints.stacks.BlueprintBuilder {

  /**
   * This method helps you prepare a blueprint for setting up EKS cluster with
   * Bottlerock image and addons for karpenter and monitoring
   */
  public static builder(options: EksClusterOptions): EksClusterStackBuilder {
    const builder = new EksClusterStackBuilder();
    const mergedOptions = merge(defaultOptions, options);

    // combine list of all valid instance classes and sizes
    const nodeInstanceTypes =
      (mergedOptions.instanceClasses ?? DEFAULT_NODES_INSTANCE_CLASSES).map(instance_class =>
        (mergedOptions.instanceSizes ?? DEFAULT_NODES_INSTANCE_SIZES).map(size =>
          ec2.InstanceType.of(instance_class, size),
        ),
      ).flat();

    const clusterProvider = new blueprints.GenericClusterProvider({
      version: mergedOptions.kubernetesVersion,
      tags: mergedOptions.clusterProviderTags,
      managedNodeGroups: [
        {
          id: 'mng-ondemand',
          amiType: eks.NodegroupAmiType.BOTTLEROCKET_X86_64,
          instanceTypes: nodeInstanceTypes,
          minSize: mergedOptions.minNodeSize,
          desiredSize: mergedOptions.desiredNodeSize,
          maxSize: mergedOptions.maxNodeSize,
        },
        {
          id: 'mng2-spot',
          instanceTypes: nodeInstanceTypes,
          nodeGroupCapacityType: eks.CapacityType.SPOT,
          minSize: mergedOptions.minSpotNodeSize,
        },
      ],
      fargateProfiles: {
        fp1: {
          fargateProfileName: 'fp1',
          selectors: [{ namespace: 'serverless1' }],
        },
        fp2: {
          fargateProfileName: 'fp2',
          selectors: [{ namespace: 'serverless2' }],
        },
      },
    });

    return builder
      .clusterProvider(clusterProvider)
      .addOns(
        new blueprints.AwsLoadBalancerControllerAddOn,
        new blueprints.CertManagerAddOn,
        // new blueprints.AdotCollectorAddOn({
        //   // namespace:'adot', //User supplied, non-default namespace
        //   version: 'v0.80.0-eksbuild.2'
        // }),
        // new blueprints.AppMeshAddOn,
        new blueprints.NginxAddOn,
        // new blueprints.ArgoCDAddOn,
        // new blueprints.CalicoOperatorAddOn,
        new blueprints.MetricsServerAddOn,
        // new blueprints.ClusterAutoScalerAddOn({
        //   version: '9.34.0'
        // }),
        //  new blueprints.CloudWatchAdotAddOn,
        // new blueprints.XrayAdotAddOn,
        new blueprints.SecretsStoreAddOn,
      );
  }
}