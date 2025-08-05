import { App } from 'aws-cdk-lib';
import { CreateRoleProvider } from '@aws-quickstart/eks-blueprints';
import { Template } from 'aws-cdk-lib/assertions';
import { EksClusterStackBuilder, PlatformTeamByUsers } from '../src';
import { ArnPrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';

jest.useFakeTimers(); // speed-up test execution

describe('synth correctly', () => {

  test('Stack creation matches snapshot', () => {
    const app = new App();

    const stackbuilder = EksClusterStackBuilder.builder({ domainName: 'snapshot.internal' });

    const stack = stackbuilder
      .account(app.account)
      .region(app.region)
      .resourceProvider('master-role',
        new CreateRoleProvider('master-role',
          new ArnPrincipal(`arn:aws:iam::${app.account}:root`),
          [ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess')]
        ))
      .teams(new PlatformTeamByUsers( [`arn:aws:iam::${app.account}:user/my-user`] ))
      .build(app, 'snapshot-stack');

    expect(stackbuilder).toBeDefined();

    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });
});