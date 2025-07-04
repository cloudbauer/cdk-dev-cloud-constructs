import * as blueprints from '@aws-quickstart/eks-blueprints';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as eks from 'aws-cdk-lib/aws-eks';
import { ArnPrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

// Blueprints Lib
// import teams from '@aws-quickstart/eks-blueprints';

// Team implementations
class TeamPlatform extends blueprints.teams.PlatformTeam {
  constructor(accountID: string) {
    super({
      name: 'platform',
      users: [new ArnPrincipal(`arn:aws:iam::${accountID}:user/superadmin`)],
    });
  }
}

/**
 * Properties for the EksCluster construct
 */
export interface EksClusterStackProps extends cdk.StackProps {
  /**
     * cluster base domain name
     */
  readonly domainName?: string;
}


/**
 * Demonstrates how to leverage more than one node group along with Fargate profiles.
 */

export class EksClusterStackBuilder {
  constructor(scope: Construct, id: string, props?: EksClusterStackProps) {

    const account = props?.env?.account!;
    const region = props?.env?.region!;

    // Setup platform team
    const platformTeam = new TeamPlatform(account);

    const stackID = `${id}-stack`;

    const clusterProvider = new blueprints.GenericClusterProvider({
      version: eks.KubernetesVersion.V1_31,
      managedNodeGroups: [
        {
          id: 'mng-ondemand',
          amiType: eks.NodegroupAmiType.AL2_X86_64,
          instanceTypes: [new ec2.InstanceType('t3.medium')],
          minSize: 3,
          maxSize: 6,
        },
        {
          id: 'mng2-spot',
          instanceTypes: [ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MEDIUM)],
          nodeGroupCapacityType: eks.CapacityType.SPOT,
          minSize: 3,
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

    blueprints.EksBlueprint.builder()
      .account(account)
      .region(region)
      .clusterProvider(clusterProvider)
      .addOns(
        new blueprints.AwsLoadBalancerControllerAddOn,
        new blueprints.CertManagerAddOn,
        new blueprints.AdotCollectorAddOn,
        new blueprints.AppMeshAddOn,
        new blueprints.NginxAddOn,
        // new blueprints.ArgoCDAddOn,
        // new blueprints.CalicoOperatorAddOn,
        new blueprints.MetricsServerAddOn,
        new blueprints.ClusterAutoScalerAddOn,
        new blueprints.CloudWatchAdotAddOn,
        // new blueprints.XrayAdotAddOn,
        new blueprints.SecretsStoreAddOn,
      )
      .teams(platformTeam)
      .version('auto')
      .build(scope, stackID);
  }
}