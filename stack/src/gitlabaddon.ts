import assert from 'assert';
import { AwsLoadBalancerControllerAddOn } from '@aws-quickstart/eks-blueprints/dist/addons/aws-loadbalancer-controller';
import { EbsCsiDriverAddOn } from '@aws-quickstart/eks-blueprints/dist/addons/ebs-csi-driver';
import { EfsCsiDriverAddOn } from '@aws-quickstart/eks-blueprints/dist/addons/efs-csi-driver';
import { HelmAddOn, HelmAddOnProps, HelmAddOnUserProps } from '@aws-quickstart/eks-blueprints/dist/addons/helm-addon';
import { ClusterInfo } from '@aws-quickstart/eks-blueprints/dist/spi';
import { createNamespace, setPath, supportsALL } from '@aws-quickstart/eks-blueprints/dist/utils';
import {
  RemovalPolicy,
  aws_efs as efs,
  aws_ec2 as ec2,
  aws_certificatemanager as acm,
} from 'aws-cdk-lib';
import { Construct } from 'constructs';

/**
 * Configuration options for exposing the GitLab proxy
 */
export enum GitLabServiceType {
  /**
   * Expose the service using AWS Application Load Balancer + Ingress controller
   */
  ALB,

  /**
   * Expose the service using AWS Network Load Balancer + LoadBalancer service
   */
  NLB,

  /**
   * Use ClusterIP service type and allow customers to port-forward for localhost access
   */
  CLUSTERIP,
}

/**
 * Configuration options for the add-on.
 */
export interface GitLabAddOnProps extends HelmAddOnUserProps {

  /**
   * Configurations necessary to use EBS as Persistent Volume
   * @property {string} storageClass - storage class for the volume
   * @property {string} capacity - storage capacity (in Mi or Gi)
   */
  ebsConfig?: {
    storageClass: string;
    capacity: string;
  };

  /**
   * Configuration necessary to use EFS as Persistent Volume
   * @property {RemovalPolicy} removalPolicy - Removal Policy for EFS (DESTROY, RETAIN or SNAPSHOT)
   * @property {string} pvcName - Name of the Volume to be used for PV and PVC
   * @property {string} capacity - Storage Capacity (in Mi or Gi)
   */
  efsConfig?: {
    removalPolicy: RemovalPolicy;
    pvcName: string;
    capacity: string;
  };

  /**
   * Configuration settings for OpenID Connect authentication protocol
   */
  oidcConfig?: {
    callbackUrl: string;
    authUrl: string;
    tokenUrl: string;
    userDataUrl: string;
    clientId: string;
    clientSecret: string;
    scope?: string[];
    usernameKey?: string;
  };

  /**
   * Configuration to set how the hub service will be exposed
   * See enum GitLabService for choices
   */
  serviceType: GitLabServiceType;

  /**
   * Ingress host - only if Ingress is enabled
   * It is the available host domain to be routed upon request
   */
  ingressHost: string;

  /**
   * Ingress annotations - only apply if Ingress is enabled, otherwise throws an error
   */
  ingressAnnotations?: {
    [key: string]: string;
  };

  /**
   * Name of the certificate {@link NamedResourceProvider} to be used for certificate look up.
   * @see {@link ImportCertificateProvider} and {@link CreateCertificateProvider} for examples of certificate providers.
   */
  certificateResourceName?: string;

  /**
   * Enable namespace creation in cluster to use for deployment.
   * @default - if not specified, false will be used
   */
  createNamespace?: boolean;
}

/**
 * Defaults options for the add-on
 */
const defaultProps: HelmAddOnProps = {
  name: 'gitlab',
  namespace: 'default',
  version: '9.1.1',
  chart: 'gitlab',
  release: 'gitlab',
  repository: 'https://charts.gitlab.io',
  values: {},
};

/**
 * Implementation of the GitLab add-on
 */
@supportsALL
export class GitLabAddOn extends HelmAddOn {

  readonly options: GitLabAddOnProps;

  constructor(props?: GitLabAddOnProps) {
    super({ ...defaultProps, ...props });
    this.options = this.props as GitLabAddOnProps;
  }

  deploy(clusterInfo: ClusterInfo): Promise<Construct> {
    const cluster = clusterInfo.cluster;
    let values = this.options.values ?? {};

    // The addon requires a persistent storage option
    // assert(this.options.ebsConfig || this.options.efsConfig, "You need to provide a persistent storage option.");

    // But you can only provide one option for persistent storage
    // assert(!(this.options.ebsConfig && this.options.efsConfig), "You cannot provide more than one persistent storage option.");

    // Create Namespace
    const ns = this.options.createNamespace? createNamespace(this.options.namespace!, cluster, true, true): undefined;


    // Persistent Storage Setup for EBS
    // if (this.options.ebsConfig){
    //     this.addEbsStorage(clusterInfo, values, this.options.ebsConfig);
    // }

    // Persistent Storage Setup for EFS
    // if (this.options.efsConfig) {
    //     this.addEfsStorage(clusterInfo, values, this.options.efsConfig);
    // }

    // OpenID Connect authentication setup
    // if (this.options.oidcConfig){
    //     setPath(values, "hub.config", {
    //         "GitLab": { "authenticator_class": "generic-oauth" },
    //         "GenericOAuthenticator": {
    //             "client_id": this.options.oidcConfig.clientId,
    //             "client_secret": this.options.oidcConfig.clientSecret,
    //             "oauth_callback_url": this.options.oidcConfig.callbackUrl,
    //             "authorize_url": this.options.oidcConfig.authUrl,
    //             "token_url": this.options.oidcConfig.tokenUrl,
    //             "userdata_url": this.options.oidcConfig.userDataUrl,
    //             "scope":  this.options.oidcConfig.scope,
    //             "username_key":  this.options.oidcConfig.usernameKey,
    //         }
    //     });
    // }

    // Proxy information - set either ALB, NLB (default) or ClusterIP service based on
    // provided configuration
    const serviceType = this.options.serviceType;
    const ingressHost = this.options.ingressHost;
    const ingressAnnotations = this.options.ingressAnnotations;
    const cert = this.options.certificateResourceName;

    const albAddOnCheck = clusterInfo.getScheduledAddOn(AwsLoadBalancerControllerAddOn.name);
    // Use Ingress and AWS ALB
    if (serviceType == GitLabServiceType.ALB) {
      // assert(albAddOnCheck, `Missing a dependency: ${AwsLoadBalancerControllerAddOn.name}. Please add it to your list of addons.`);
      const presetAnnotations: any = {
        'alb.ingress.kubernetes.io/scheme': 'internet-facing',
        'alb.ingress.kubernetes.io/target-type': 'ip',
        'alb.ingress.kubernetes.io/group.name': 'gitlab',
        'kubernetes.io/ingress.class': 'alb',
        'nginx.ingress.kubernetes.io/connection-proxy-header': 'keep-alive',
      };
      presetAnnotations['alb.ingress.kubernetes.io/ssl-redirect'] = '443';
      presetAnnotations['alb.ingress.kubernetes.io/listen-ports'] = '[{"HTTP": 80},{"HTTPS":443}]';
      presetAnnotations['alb.ingress.kubernetes.io/backend-protocol'] = 'HTTP';
      if (cert) {
        const certificate = clusterInfo.getResource<acm.ICertificate>(cert);
        presetAnnotations['alb.ingress.kubernetes.io/certificate-arn'] = certificate?.certificateArn;
      } else {
        presetAnnotations['kubernetes.io/tls-acme'] = 'true';
      }
      const annotations = { ...ingressAnnotations, ...presetAnnotations };
      setPath(values, 'global.ingress.annotations', annotations);

      setPath(values, 'nginx-ingress.enabled', false); // Disable nginx-ingress
      setPath(values, 'global.hosts.domain', ingressHost);
      setPath(values, 'global.email.from', 'gitlab@' + ingressHost);
      setPath(values, 'global.email.display_name', `GitLab (${ingressHost})`);
      setPath(values, 'installCertmanager', false);
      setPath(values, 'global.ingress.class', 'none');
      setPath(values, 'global.ingress.enabled', 'true');
      setPath(values, 'global.ingress.path', '/*');
      setPath(values, 'global.ingress.pathType', 'ImplementationSpecific');
      setPath(values, 'global.ingress.provider', 'aws');

      if (cert) {
        setPath(values, 'global.hosts.ssh', 'gitlab-ssh.' + ingressHost); // Different dns endpoint for webservice and ssh is needed
        setPath(values, 'global.ingress.configureCertmanager', false);
        setPath(values, 'global.ingress.tls.enabled', false);
        setPath(values, 'gitlab.webservice.enabled', true);
        setPath(values, 'gitlab.webservice.service.type', 'NodePort');
        setPath(values, 'gitlab.kas.enabled', true);
        setPath(values, 'gitlab.kas.service.type', 'NodePort');
        setPath(values, 'gitlab.kas.ingress.annotations', {
          'alb.ingress.kubernetes.io/healthcheck-path': '/liveness',
          'alb.ingress.kubernetes.io/healthcheck-port': '8151',
          'alb.ingress.kubernetes.io/load-balancer-attributes': 'idle_timeout.timeout_seconds=4000,routing.http2.enabled=false',
          'alb.ingress.kubernetes.io/target-group-attributes': 'stickiness.enabled=true,stickiness.lb_cookie.duration_seconds=86400',
          'alb.ingress.kubernetes.io/target-type': 'ip',
          'kubernetes.io/tls-acme': 'true',
          'nginx.ingress.kubernetes.io/connection-proxy-header': 'keep-alive',
          'nginx.ingress.kubernetes.io/x-forwarded-prefix': '"/path',
        });
        setPath(values, 'gitlab.gitlab-shell.enabled', true); // gitlab-shell (ssh) needs an NLB
        setPath(values, 'gitlab.gitlab-shell.service.type', 'LoadBalancer');
        setPath(values, 'gitlab.kas.ingress.annotations', {
          'external-dns.alpha.kubernetes.io/hostname': 'gitlab-shell.' + ingressHost,
          'service.beta.kubernetes.io/aws-load-balancer-nlb-target-type': 'ip',
          'service.beta.kubernetes.io/aws-load-balancer-scheme': 'internet-facing',
          'service.beta.kubernetes.io/aws-load-balancer-type': 'external',
        });
        setPath(values, 'registry.enabled', true);
        setPath(values, 'registry.service.type', 'NodePort');
      } else {
        setPath(values, 'certmanager-issuer.email', 'admin@' + ingressHost);
        setPath(values, 'gitlab.webservice.ingress.tls.secretName', 'gitlab-ingress-webservice-tls');
        setPath(values, 'gitlab.kas.ingress.tls.secretName', 'gitlab-ingress-kas-tls');
        setPath(values, 'registry.ingress.tls.secretName', 'gitlab-ingress-registry-tls');
        setPath(values, 'minio.ingress.tls.secretName', 'gitlab-ingress-minio-tls');
      }


      /*
UPGRADE FAILED: failed to create resource: Ingress.networking.k8s.io "gitlab-kas"
is invalid: annotations.kubernetes.io/ingress.class: Invalid value: "alb": must match `ingressClassName` when both are specified\n'


 AWS Load Balancer Controller using ALB Ingress
# minimal settings needed to run gitlab on ALB
# Note that when using an ALB ingress controller we need to use a separate NLB for gitlab-shell (ssh) connections.

# Disable nginx-ingress
nginx-ingress:
  enabled: false
# Common settings for AWS Load Balancer Controller
global:
  hosts:
    domain: example.com
    # we need a different dns endpoint for webservice and ssh
    ssh: gitlab-shell.example.com
  ingress:
    # Common annotations used by kas, registry, and webservice
    annotations:
      alb.ingress.kubernetes.io/backend-protocol: HTTP
      alb.ingress.kubernetes.io/certificate-arn: arn:aws:acm:us-east-2:123456789012:certificate/01234567-89ab-cdef-0123-456789abcdef
      alb.ingress.kubernetes.io/group.name: gitlab
      alb.ingress.kubernetes.io/listen-ports: '[{"HTTPS": 443}]'
      alb.ingress.kubernetes.io/scheme: internet-facing
      alb.ingress.kubernetes.io/target-type: ip
      kubernetes.io/ingress.class: alb
      nginx.ingress.kubernetes.io/connection-proxy-header: "keep-alive"
    class: none
    configureCertmanager: false
    enabled: true
    path: /*
    pathType: ImplementationSpecific
    provider: aws
    tls:
      enabled: false
gitlab:
  kas:
    enabled: true
    ingress:
      # Specific annotations needed for kas service to support websockets
      annotations:
        alb.ingress.kubernetes.io/healthcheck-path: /liveness
        alb.ingress.kubernetes.io/healthcheck-port: "8151"
        alb.ingress.kubernetes.io/healthcheck-protocol: HTTP
        alb.ingress.kubernetes.io/load-balancer-attributes: idle_timeout.timeout_seconds=4000,routing.http2.enabled=false
        alb.ingress.kubernetes.io/target-group-attributes: stickiness.enabled=true,stickiness.lb_cookie.duration_seconds=86400
        alb.ingress.kubernetes.io/target-type: ip
        kubernetes.io/tls-acme: "true"
        nginx.ingress.kubernetes.io/connection-proxy-header: "keep-alive"
        nginx.ingress.kubernetes.io/x-forwarded-prefix: "/path"
    # k8s services exposed via an ingress rule to an ELB need to be of type NodePort
    service:
      type: NodePort
  webservice:
    enabled: true
    service:
      type: NodePort
  # gitlab-shell (ssh) needs an NLB
  gitlab-shell:
    enabled: true
    service:
      annotations:
        external-dns.alpha.kubernetes.io/hostname: "gitlab-shell.example.com"
        service.beta.kubernetes.io/aws-load-balancer-nlb-target-type: "ip"
        service.beta.kubernetes.io/aws-load-balancer-scheme: "internet-facing"
        service.beta.kubernetes.io/aws-load-balancer-type: "external"
      type: LoadBalancer
registry:
  enabled: true
  service:
    type: NodePort
*/

    } else {
      assert(!ingressHost, 'Ingress Hosts CANNOT be assigned when ingress is disabled');
      assert(!ingressAnnotations, 'Ingress annotations CANNOT be assigned when ingress is disabled');
      assert(!cert, 'Cert option is only supported if ingress is enabled.');
      // If we set SVC, set the proxy service type to ClusterIP and allow users to port-forward to localhost
      if (serviceType == GitLabServiceType.CLUSTERIP) {
        setPath(values, 'proxy.service', { type: 'ClusterIP' });
        // We will use NLB
      } else {
        assert(albAddOnCheck, `Missing a dependency: ${AwsLoadBalancerControllerAddOn.name}. Please add it to your list of addons.`);
        setPath(values, 'proxy.service', {
          annotations: {
            'service.beta.kubernetes.io/aws-load-balancer-type': 'nlb',
            'service.beta.kubernetes.io/aws-load-balancer-scheme': 'internet-facing',
            'service.beta.kubernetes.io/aws-load-balancer-nlb-target-type': 'ip',
          },
        });
      }
    }

    // Create Helm Chart
    const gitlabHelmChart = this.addHelmChart(clusterInfo, values, false, false);

    // Add dependency
    if (ns) {gitlabHelmChart.node.addDependency(ns);}

    if (albAddOnCheck) {
      albAddOnCheck.then(construct => gitlabHelmChart.node.addDependency(construct));
    }
    return Promise.resolve(gitlabHelmChart);
  }
  /**
     * This is a helper function to create EBS persistent storage
     * @param {ClusterInfo} clusterInfo - Cluster Info
     * @param {string} values - Helm Chart Values
     * @param {string} ebsConfig - EBS Configurations supplied by user
     * @returns
     */
  protected addEbsStorage(clusterInfo: ClusterInfo, values: any, ebsConfig: any) {
    const dep = clusterInfo.getScheduledAddOn(EbsCsiDriverAddOn.name);
    assert(dep, `Missing a dependency: ${EbsCsiDriverAddOn.name}. Please add it to your list of addons.`);
    // Create persistent storage with EBS
    const storageClass = ebsConfig.storageClass;
    const ebsCapacity = ebsConfig.capacity;
    setPath(values, 'singleuser.storage', {
      dynamic: { storageClass: storageClass },
      capacity: ebsCapacity,
    });
  }

  /**
     * This is a helper function to create EFS persistent storage
     * @param {ClusterInfo} clusterInfo - Cluster Info
     * @param {string} values - Helm Chart Values
     * @param {string} efsConfig - EFS Configurations supplied by user
     * @returns
     */
  protected addEfsStorage(clusterInfo: ClusterInfo, values: any, efsConfig: any) {
    const dep = clusterInfo.getScheduledAddOn(EfsCsiDriverAddOn.name);
    assert(dep, `Missing a dependency: ${EfsCsiDriverAddOn.name}. Please add it to your list of addons.`);

    const pvcName = efsConfig.pvcName;
    const removalPolicy = efsConfig.removalPolicy;
    const efsCapacity = efsConfig.capacity;

    this.setupEFS(clusterInfo, this.options.namespace!, pvcName, efsCapacity, removalPolicy);
    setPath(values, 'singleuser.storage', {
      type: 'static',
      static: {
        pvcName: `${pvcName}`,
        subPath: 'home/{username}',
      },
    });
  }
  /**
     * This is a helper function to use EFS as persistent storage
     * including necessary security group with ingress rule,
     * EFS File System, Kubernetes PV and PVC
     * @param {ClusterInfo} clusterInfo - Cluster Info
     * @param {string} namespace - Namespace
     * @param {string} pvcName - Name of the PV and PVC
     * @param {RemovalPolicy}removalPolicy - Removal Policy for EFS File System (RETAIN, DESTROY or SNAPSHOT)
     * @returns
     * */
  protected setupEFS(clusterInfo: ClusterInfo, namespace: string, pvcName: string, capacity: string, removalPolicy: RemovalPolicy) {
    const cluster = clusterInfo.cluster;
    const clusterVpcCidr = clusterInfo.cluster.vpc.vpcCidrBlock;

    // Security Group required for access to the File System
    // With the right ingress rule
    const gitlabSG = new ec2.SecurityGroup(
      cluster.stack, 'MyEfsSecurityGroup',
      {
        vpc: clusterInfo.cluster.vpc,
        securityGroupName: 'EksBlueprintsJHubEFSSG',
      },
    );
    gitlabSG.addIngressRule(
      ec2.Peer.ipv4(clusterVpcCidr),
      new ec2.Port({
        protocol: ec2.Protocol.TCP,
        stringRepresentation: 'EFSconnection',
        toPort: 2049,
        fromPort: 2049,
      }),
    );

    // Create the EFS File System
    const gitlabFileSystem = new efs.FileSystem(
      cluster.stack, 'MyEfsFileSystem',
      {
        vpc: clusterInfo.cluster.vpc,
        securityGroup: gitlabSG,
        removalPolicy: removalPolicy,
      },
    );
    const efsId = gitlabFileSystem.fileSystemId;

    // Create StorageClass
    const efsSC = cluster.addManifest('efs-storage-class', {
      apiVersion: 'storage.k8s.io/v1',
      kind: 'StorageClass',
      metadata: {
        name: 'efs-sc',
      },
      provisioner: 'efs.csi.aws.com',
    });

    // Setup PersistentVolume and PersistentVolumeClaim
    const efsPV = cluster.addManifest('efs-pv', {
      apiVersion: 'v1',
      kind: 'PersistentVolume',
      metadata: {
        name: `${pvcName}`,
        namespace: namespace,
      },
      spec: {
        capacity: { storage: `${capacity}` },
        volumeMode: 'Filesystem',
        accessModes: ['ReadWriteMany'],
        storageClassName: 'efs-sc',
        csi: {
          driver: 'efs.csi.aws.com',
          volumeHandle: `${efsId}`,
        },
      },
    });
    efsPV.node.addDependency(efsSC);
    efsPV.node.addDependency(gitlabFileSystem);

    const efsPVC = cluster.addManifest('efs-pvc', {
      apiVersion: 'v1',
      kind: 'PersistentVolumeClaim',
      metadata: {
        name: `${pvcName}`,
        namespace: namespace,
      },
      spec: {
        storageClassName: 'efs-sc',
        accessModes: ['ReadWriteMany'],
        resources: { requests: { storage: `${capacity}` } },
      },
    });
    efsPVC.node.addDependency(efsPV);
  }
}

