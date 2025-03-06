import { awscdk } from 'projen';
const project = new awscdk.AwsCdkConstructLibrary({
  name: 'cdk-dev-cloud-constructs',
  description: 'CDK Construct Library to create an open source developer platform at AWS',
  author: 'bitbauer',
  authorAddress: '4582513+bitbauer@users.noreply.github.com',
  stability: 'experimental',
  cdkVersion: '2.177.0',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.7.0',
  keywords: ['awscdk', 'gitlab', 'jenkins'],
  
  // publishToPypi: {
  //   distName: 'cdk-dev-cloud-constructs',
  //   module: 'cdk_dev_cloud_constructs',
  // },
  projenrcTs: true,
  repositoryUrl: 'https://github.com/cloudbauer/cdk-dev-cloud-constructs.git',

  // deps: [],                /* Runtime dependencies of this module. */
  // description: undefined,  /* The description is just a string that helps people understand the purpose of the package. */
  // devDeps: [],             /* Build dependencies for this module. */
  license: 'MIT',
});
project.synth();