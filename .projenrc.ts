import { awscdk, typescript } from 'projen';

// Constants
const GITHUB_USER = 'cloudbauer';
const PROJECT_NAME = 'cdk-dev-cloud-constructs';
const CDK_VERSION: string = '2.173.4';
const CDK_CONSTRUCTS_VERSION: string = '10.4.2';

const eksChartsConstructs = new awscdk.AwsCdkConstructLibrary({
  name: PROJECT_NAME,
  description: 'CDK Construct Library to create an open source developer platform at AWS',
  stability: 'experimental',
  cdkVersion: CDK_VERSION,
  constructsVersion: CDK_CONSTRUCTS_VERSION,
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.7.0',
  keywords: ['awscdk', 'eks', 'kubernetes', 'gitlab', 'jenkins'],
  deps: [
    'cdk-nag',
  ],

  publishToPypi: {
    distName: 'cdk-dev-cloud-constructs',
    module: 'cdk_dev_cloud_constructs',
  },
  projenrcTs: true,
  repositoryUrl: 'https://github.com/' + GITHUB_USER + '/' + PROJECT_NAME,
  npmignore: [
    '/stack/',
  ],

  // deps: [],                /* Runtime dependencies of this module. */
  // devDeps: [],             /* Build dependencies for this module. */
  author: 'bitbauer',
  authorAddress: '4582513+bitbauer@users.noreply.github.com',
  license: 'MIT',
});

const eksClusterBuilder = new typescript.TypeScriptProject({
  parent: eksChartsConstructs,
  name: 'cdk-dev-cloud-stack',
  description: 'CDK Blueprint Builder for EKS Stack to create an open source developer platform at AWS',
  defaultReleaseBranch: 'main',
  stability: 'experimental',
  keywords: ['awscdk', 'eks', 'kubernetes', 'gitlab', 'jenkins'],
  projenrcTs: true,
  deps: [
    '@aws-quickstart/eks-blueprints@1.16.3',
    'aws-cdk-lib@' + CDK_VERSION,
    'constructs@' + CDK_CONSTRUCTS_VERSION,
    'cdk-nag',
  ],
  peerDeps: [
    'aws-cdk@' + CDK_VERSION,
  ],

  outdir: 'stack',
  releaseToNpm: true,
  release: true,

  copyrightOwner: 'bitbauer',
  license: 'MIT',
});

eksChartsConstructs.synth();
eksClusterBuilder.synth();