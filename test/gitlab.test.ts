import { App, Stack, aws_eks } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { GitlabConstruct, GitlabProps } from '../src';


jest.useFakeTimers();

describe('gitlab-chart', () => {
  test('c-default-props', () => {
    const app = new App();
    const stack = new Stack(app, 'testStack', {
      env: {
        region: 'eu-central-1',
        account: '123567891',
      },
    });

    // Creating an EKS Cluster with default properties and Fargate workers
    const cluster = new aws_eks.FargateCluster(stack, 'EksFargateCluster', {
      version: aws_eks.KubernetesVersion.V1_31,
    });

    const testProps: GitlabProps = {
      cluster: cluster,
    };

    new GitlabConstruct(stack, 'testGitlabChart', testProps);

    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });

  test('cluster-custom-props', () => {
    const app = new App();
    const stack = new Stack(app, 'testStack', {
      env: {
        region: 'eu-central-1',
        account: '123567891',
      },
    });

    // Creating an EKS Cluster with default properties and Fargate workers
    const cluster = new aws_eks.FargateCluster(stack, 'EksFargateCluster', {
      version: aws_eks.KubernetesVersion.V1_31,
    });

    const testProps: GitlabProps = {
      cluster: cluster,
      namespace: 'gitlab',
      domainName: 'gitlab.internal',
      chartName: 'gitlab',
      chartVersion: '8.11.7',
      valuesOverride: { 'global.hosts.domain': 'test' },
    };

    const testResource = new GitlabConstruct(stack, 'testGitlabChart', testProps);
    expect(testResource.values.global.hosts.domain).toEqual('test');

    const template = Template.fromStack(stack);
    expect(template.toJSON()).toMatchSnapshot();
  });
});