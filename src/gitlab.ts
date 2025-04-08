import { Construct } from 'constructs';
/*
import {
    Aspects,
    CfnOutput,
    Duration,
    IAspect,
    Stack,
    Tags,
} from 'aws-cdk-lib';
import { Construct, IConstruct } from 'constructs';
import { NagSuppressions } from 'cdk-nag';
*/

/**
 * Properties for the Gitlab construct
 */
export interface GitlabProps {
  /**
   * Gitlab full qualified domain name
   */
  readonly domainName?: string;
}

/**
 * VSCodeServer - spin it up in under 10 minutes
 */
export class Gitlab extends Construct {
  domainName: string;

  constructor(scope: Construct, id: string, props?: GitlabProps) {
    super(scope, id);

    // defaults
    this.domainName = props?.domainName ?? 'gitlab.example.com';
  }

  domain() {
    return this.domainName;
  }
}