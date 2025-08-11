import { awscdk, typescript, JsonPatch, TestFailureBehavior } from 'projen';

// Constants
const GITHUB_USER = 'cloudbauer';
const PROJECT_NAME = 'cdk-dev-cloud-constructs';
const EKS_BLUEPRINTS_VERSION = '1.17.2'; // '1.16.3';
const CDK_LIB_VERSION: string = '2.204.0'; // '2.173.4';
const CDK_CLI_VERSION: string = '2.1020.2';
const CDK_CONSTRUCTS_VERSION: string = '10.4.2'; // '10.4.2';
const CDK_NAG_VERSION: string = '^2.35.70';

const parent = new awscdk.AwsCdkConstructLibrary({
  name: PROJECT_NAME,
  description: 'CDK Construct Library to create an open source developer platform at AWS',
  stability: 'experimental',
  cdkVersion: CDK_LIB_VERSION,
  cdkCliVersion: CDK_CLI_VERSION,
  constructsVersion: CDK_CONSTRUCTS_VERSION,
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.7.0',
  keywords: ['awscdk', 'eks', 'kubernetes', 'gitlab', 'jenkins'],
  deps: [
    '@aws-cdk/lambda-layer-kubectl-v32',
    'cdk-nag@' + CDK_NAG_VERSION,
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
    '/examples/',
  ],

  // deps: [],                /* Runtime dependencies of this module. */
  // devDeps: [],             /* Build dependencies for this module. */
  author: 'bitbauer',
  authorAddress: '4582513+bitbauer@users.noreply.github.com',
  license: 'MIT',
});

const stackbuilder = new typescript.TypeScriptProject({
  parent: parent,
  name: 'cdk-dev-cloud-stack',
  description: 'CDK Blueprint Builder for EKS Stack to create an open source developer platform at AWS',
  defaultReleaseBranch: 'main',
  stability: 'experimental',
  keywords: ['awscdk', 'eks', 'kubernetes', 'gitlab', 'jenkins'],

  deps: [
    '@aws-quickstart/eks-blueprints@' + EKS_BLUEPRINTS_VERSION,
    'aws-cdk-lib@' + CDK_LIB_VERSION,
    'constructs@' + CDK_CONSTRUCTS_VERSION,
    'cdk-nag@' + CDK_NAG_VERSION,
    'source-map-support',
    'ts-deepmerge',
  ],
  peerDeps: [
    'aws-cdk@' + CDK_CLI_VERSION,
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
parent.tryFindObjectFile('.github/workflows/release_cdk-dev-cloud-stack.yml')?.patch(
  JsonPatch.test('/jobs/release/steps/2/name', 'Install dependencies', TestFailureBehavior.FAIL_SYNTHESIS),
  JsonPatch.remove('/jobs/release/steps/2/working-directory'),
);

const examples = new awscdk.AwsCdkTypeScriptApp({
  parent: parent,
  cdkVersion: CDK_LIB_VERSION,
  constructsVersion: CDK_CONSTRUCTS_VERSION,
  cdkCliVersion: CDK_CLI_VERSION,
  // typescriptVersion: '5.8.2',
  defaultReleaseBranch: 'main',
  name: 'example-dev-cloud',
  projenrcTs: true,

  deps: [
    '@aws-quickstart/eks-blueprints@' + EKS_BLUEPRINTS_VERSION,
    'cdk-nag@' + CDK_NAG_VERSION,
    'source-map-support',
    'ts-deepmerge',
  ],

  outdir: 'examples',
  jest: false,
  release: false,
  licensed: false,
});

// Fixed problems with different version of CDK library, because internally used ^ version specifier
examples.deps.removeDependency('aws-cdk-lib');
examples.addDeps('aws-cdk-lib@' + CDK_LIB_VERSION);
examples.deps.removeDependency('constructs');
examples.addDeps('constructs@' + CDK_CONSTRUCTS_VERSION);

parent.synth();
examples.synth();
stackbuilder.synth();