import { readFileSync } from 'fs';
import { aws_eks as eks } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { merge } from 'ts-deepmerge';
import { parse } from 'yaml';
// import { NagSuppressions } from 'cdk-nag';


/**
 * Properties for the GitLab Helm Chart construct
 */
export interface GitlabProps {
  /**
   * Gitlab full qualified domain name
   */
  readonly cluster: eks.ICluster;
  readonly namespace?: string;
  readonly domainName?: string;
  readonly chartName?: string;
  readonly chartVersion?: string;
  readonly valuesOverride?: Map<string, string>;
  readonly valuesYamlFile?: string;
}


/**
 * GitLab Helm Chart construct for Kubernetes on AWS
 */
export class GitlabConstruct extends Construct {
  readonly cluster: eks.ICluster;
  readonly namespace: string;
  readonly chart: eks.HelmChart;
  readonly name: string;
  readonly domainName: string;
  readonly defaultValues: { [key: string]: any };
  readonly mergedValues: { [key: string]: any };
  readonly yamlValues: { [key: string]: any };

  private _version: string;

  constructor(scope: Construct, id: string, props: GitlabProps) {
    super(scope, id);

    this.cluster = props.cluster;

    // defaults
    this.domainName = props.domainName ?? 'gitlab.example.com';
    this.namespace = props.namespace ?? 'default';
    this.name = props.chartName ?? 'gitlab';
    this._version = props.chartVersion ?? 'latest';

    // set initial default values
    this.defaultValues = {
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

    // load and merge values from yaml file if given
    this.yamlValues = props.valuesYamlFile? parse(readFileSync(props.valuesYamlFile, 'utf8')) : {};
    this.mergedValues = merge(this.defaultValues, this.yamlValues);

    // overwrite each value given by dotted key path
    for (let [key, value] of (props.valuesOverride ?? new Map())) {
      const keys = key.split('.');
      let values = this.mergedValues;
      let key_part: string | undefined;

      while (key_part = keys.shift()) {
        if (keys.length == 0) {values[key_part] = value;} else if (values[key_part] === undefined) {values[key_part] = {};}

        values = values[key_part];
      }
    }

    this.chart = new eks.HelmChart(this, id + 'Chart', {
      cluster: this.cluster,
      chart: this.name,
      repository: 'https://charts.gitlab.io/',
      namespace: this.namespace,
      version: this._version,
      values: this.mergedValues,
    });
  }

  get fqdn() {
    return this.domainName;
  }

  get version() {
    return this._version;
  }

  get values() {
    return this.mergedValues;
  }
}