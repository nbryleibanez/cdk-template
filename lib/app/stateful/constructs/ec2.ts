import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

interface Ec2ConstructProps {
  stage: string;
  vpc: ec2.IVpc;
}

export class Ec2Construct extends Construct {
  private instance: ec2.Instance;

  constructor(scope: Construct, id: string, props: Ec2ConstructProps) {
    super(scope, id);

    this.createEc2(props);
  }

  private createEc2(props: Ec2ConstructProps) {
    this.instance = new ec2.Instance(this, `${props.stage}-llm-EC2`, {
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      instanceName: `${props.stage}-llm-EC2`,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T4G,
        ec2.InstanceSize.NANO,
      ),
      machineImage: ec2.MachineImage.latestAmazonLinux2023(),
      securityGroup: llmInstanceSecurityGroup,
      role: llmRole,
      blockDevices: [
        {
          deviceName: "/dev/xvda",
          volume: ec2.BlockDeviceVolume.ebs(40, {
            volumeType: ec2.EbsDeviceVolumeType.GP3,
            deleteOnTermination: true,
          }),
        },
      ],
    });
  }
}
