import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { EksClusterStackBuilder, TeamPlatform } from '../src';
// import { logger } from '@aws-quickstart/eks-blueprints/dist/utils/log-utils';

jest.useFakeTimers();

describe('synth correctly', () => {

  test('Stack creation matches snapshot', () => {
    // logger.info("*");
    const app = new cdk.App();

    const stackbuilder = EksClusterStackBuilder.builder({ domainName: 'snapshot.internal' });

    const stack = stackbuilder
      .account('123567891')
      .region('eu-central-1')
      .teams(new TeamPlatform( '123567891' ))
      .build(app, 'snapshot-stack');

    expect(stackbuilder).toBeDefined();

    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });
});