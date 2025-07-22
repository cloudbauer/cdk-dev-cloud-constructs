import { awscdk, typescript, JsonPatch, TestFailureBehavior } from 'projen';

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
    'ts-deepmerge',
    'yaml',
  ],
  bundledDeps: [
    'ts-deepmerge',
    'yaml',
  ],
  jest: true,
  jestOptions: {
    passWithNoTests: true,
    jestConfig: {
      projects: ['./', './stack/'],
      testMatch: ['**/*.test.ts'],
      maxWorkers: '50%',
      detectOpenHandles: true,
    },
  },

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

  deps: [
    '@aws-quickstart/eks-blueprints@1.16.3',
    'aws-cdk-lib@' + CDK_VERSION,
    'constructs@' + CDK_CONSTRUCTS_VERSION,
    'source-map-support',
    'ts-deepmerge',
    'cdk-nag',
  ],
  peerDeps: [
    'aws-cdk@' + CDK_VERSION,
  ],

  jest: true,
  jestOptions: {
    passWithNoTests: true,
    jestConfig: {
      testMatch: ['**/*.test.ts'],
      maxWorkers: '50%',
      detectOpenHandles: true,
    },
  },

  projenrcTs: true,
  outdir: 'stack',
  releaseToNpm: true,
  release: true,
  releaseTagPrefix: 'stack_',

  repository: 'https://github.com/' + GITHUB_USER + '/' + PROJECT_NAME,
  copyrightOwner: 'bitbauer',
  license: 'MIT',
});

// fixes wrong working directory for yarn install step in release workflow
eksChartsConstructs.tryFindObjectFile('.github/workflows/release_cdk-dev-cloud-stack.yml')?.patch(
  JsonPatch.test('/jobs/release/steps/2/name', 'Install dependencies', TestFailureBehavior.FAIL_SYNTHESIS),
  JsonPatch.remove('/jobs/release/steps/2/working-directory'),
);


eksChartsConstructs.synth();
eksClusterBuilder.synth();


