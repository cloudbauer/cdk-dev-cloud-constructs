import { awscdk } from 'projen';

// Constants
const GITHUB_USER = 'cloudbauer';
const PROJECT_NAME = 'cdk-dev-cloud-constructs';
const CDK_VERSION: string = '2.173.4';

const project = new awscdk.AwsCdkConstructLibrary({
  name: PROJECT_NAME,
  description: 'CDK Construct Library to create an open source developer platform at AWS',
  author: 'bitbauer',
  authorAddress: '4582513+bitbauer@users.noreply.github.com',
  stability: 'experimental',
  cdkVersion: CDK_VERSION,
  constructsVersion: '10.4.2',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.7.0',
  keywords: ['awscdk', 'gitlab', 'jenkins'],
  deps: [
    'cdk-nag',
  ],
  devDeps: [
    '@aws-quickstart/eks-blueprints@1.16.3',
  ],
  peerDeps: [
    'aws-cdk@^' + CDK_VERSION,
  ],
  
  publishToPypi: {
    distName: 'cdk-dev-cloud-constructs',
    module: 'cdk_dev_cloud_constructs',
  },
  projenrcTs: true,
  repositoryUrl: 'https://github.com/' + GITHUB_USER + '/' + PROJECT_NAME,

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  license: 'MIT',
});
project.synth();