import {
  aws_eks as eks,
  // Aspects,
  // CfnOutput,
  // Duration,
  // IAspect,
  // Stack,
  // Tags,
} from 'aws-cdk-lib';
import { Asset } from 'aws-cdk-lib/aws-s3-assets';
import { Construct } from 'constructs';
// import { Construct, IConstruct } from 'constructs';
// import { NagSuppressions } from 'cdk-nag';

/**
 * Properties for the GitLab Helm Chart construct
 */
export interface GitlabProps {
  /**
   * Gitlab full qualified domain name
   */
  readonly cluster: eks.Cluster;
  readonly namespace?: string;
  readonly domainName?: string;
  readonly chartRepository?: string;
  readonly chartName?: string;
  readonly chartVersion?: string;
  readonly valuesOverride?: string;
  readonly valuesYamlAsset?: Asset;
}

/**
 * GitLab Helm Chart construct for Kubernetes on AWS
 */
export class GitlabConstruct extends Construct {
  readonly cluster: eks.Cluster;
  readonly namespace: string;
  readonly chart: eks.HelmChart;
  readonly name: string;
  readonly domainName: string;

  private _version: string;

  constructor(scope: Construct, id: string, props: GitlabProps) {
    super(scope, id);

    this.cluster = props.cluster;

    // defaults
    this.domainName = props.domainName ?? 'gitlab.example.com';
    this.namespace = props.namespace ?? 'default';
    this.name = props.chartName ?? 'gitlab';
    this._version = props.chartVersion ?? 'latest';

    const default_values = {
      'certmanager-issuer': {
        email: 'administrator@' + this.domainName,
      },
      'global': {
        hosts: {
          domain: this.domainName,
        },
        email: {
          from: 'gitlab@' + this.domainName,
          display_name: `GitLab (${this.domainName})`,
        },
      },
    };

    this.chart = new eks.HelmChart(this, id + 'Chart', {
      cluster: this.cluster,
      chart: this.name,
      repository: 'https://charts.gitlab.io/',
      namespace: this.namespace,
      version: this._version,
      values: default_values,
    });

  }

  get fqdn() {
    return this.domainName;
  }

  get version() {
    return this._version;
  }
}