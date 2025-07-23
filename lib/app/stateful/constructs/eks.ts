import * as iam from "aws-cdk-lib/aws-iam";
import * as eks from "aws-cdk-lib/aws-eks";
import { CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import { BaseConstructProps } from "../../types";

interface EksConstructProps extends BaseConstructProps {}

export class EksConstruct extends Construct {
  private cluster: eks.Cluster;

  constructor(scope: Construct, id: string, props: EksConstructProps) {
    super(scope, id);

    this.createEksCluster(props);
    this.deployKarpenter();
  }

  private createEksCluster(props: EksConstructProps) {
    const clusterAdmin = new iam.Role(this, "ClusterAdminRole", {
      assumedBy: new iam.AccountRootPrincipal(),
    });

    this.cluster = new eks.Cluster(this, "EksCluster", {
      version: eks.KubernetesVersion.V1_28,
      defaultCapacity: 0,
      mastersRole: clusterAdmin,
    });

    new CfnOutput(this, "ClusterName", {
      value: this.cluster.clusterName,
    });
  }

  private deployKarpenter() {
    const karpenterNamespace = "karpenter";

    // Add Karpenter namespace
    this.cluster.addManifest("KarpenterNamespace", {
      apiVersion: "v1",
      kind: "Namespace",
      metadata: { name: karpenterNamespace },
    });

    // Karpenter Node Role
    const karpenterNodeRole = new iam.Role(this, "KarpenterNodeRole", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKSWorkerNodePolicy"),
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonEC2ContainerRegistryReadOnly",
        ),
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKS_CNI_Policy"),
      ],
    });

    // Instance Profile for Nodes
    new iam.CfnInstanceProfile(this, "KarpenterInstanceProfile", {
      instanceProfileName: `${this.cluster.clusterName}-karpenter-instance-profile`,
      roles: [karpenterNodeRole.roleName],
    });

    // Karpenter Controller Role
    const karpenterControllerRole = new iam.Role(
      this,
      "KarpenterControllerRole",
      {
        assumedBy: new iam.ServicePrincipal("karpenter.sh"),
      },
    );

    karpenterControllerRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "ec2:CreateLaunchTemplate",
          "ec2:CreateFleet",
          "ec2:RunInstances",
          "ec2:CreateTags",
          "ec2:TerminateInstances",
          "ec2:Describe*",
          "ssm:GetParameter",
          "iam:PassRole",
        ],
        resources: ["*"],
      }),
    );

    // Helm Chart Installation
    this.cluster.addHelmChart("KarpenterHelm", {
      chart: "karpenter",
      release: "karpenter",
      repository: "https://charts.karpenter.sh",
      namespace: karpenterNamespace,
      version: "v0.34.0", // latest stable at the time of writing
      values: {
        serviceAccount: {
          annotations: {
            "eks.amazonaws.com/role-arn": karpenterControllerRole.roleArn,
          },
        },
        settings: {
          clusterName: this.cluster.clusterName,
          clusterEndpoint: this.cluster.clusterEndpoint,
          interruptionQueueName: `${this.cluster.clusterName}-karpenter-interruption-queue`,
        },
      },
    });

    // Provisioner Manifest
    this.cluster.addManifest("KarpenterProvisioner", {
      apiVersion: "karpenter.sh/v1alpha5",
      kind: "Provisioner",
      metadata: { name: "default" },
      spec: {
        requirements: [
          {
            key: "node.kubernetes.io/instance-type",
            operator: "In",
            values: ["t3.medium", "t3.large"],
          },
        ],
        limits: {
          resources: {
            cpu: "1000",
          },
        },
        provider: {
          subnetSelector: {
            "karpenter.sh/discovery": this.cluster.clusterName,
          },
          securityGroupSelector: {
            "karpenter.sh/discovery": this.cluster.clusterName,
          },
          instanceProfile: `${this.cluster.clusterName}-karpenter-instance-profile`,
          blockDeviceMappings: [
            {
              deviceName: "/dev/xvda",
              ebs: {
                volumeSize: 20,
                volumeType: "gp3",
              },
            },
          ],
        },
        ttlSecondsAfterEmpty: 3600,
      },
    });
  }
}
