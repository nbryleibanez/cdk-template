import * as cdk from "aws-cdk-lib";

import { Construct } from "constructs";
import { StatefulStackProps } from "../types";
import { EcsConstruct } from "./constructs/ecs";
import { VpcConstruct } from "./constructs/vpc";

export class StatefulStack extends cdk.Stack {
  public ecsConstruct: EcsConstruct;

  private vpcConstruct: VpcConstruct;
  private rdsConstruct: RdsConstruct;

  constructor(scope: Construct, id: string, props: StatefulStackProps) {
    super(scope, id, props);

    this.createVpcConstruct(props);
    this.createOutputs(props);
  }

  private createVpcConstruct(props: StatefulStackProps) {
    this.vpcConstruct = new VpcConstruct(this, `${props.stage}-VPC-Construct`, {
      stage: props.stage,
    });
  }

  private createEcsConstruct(props: StatefulStackProps) {
    this.ecsConstruct = new EcsConstruct(this, `${props.stage}-ECS-Construct`, {
      stage: props.stage,
      vpc: this.vpcConstruct.vpc,
      repository: props.repository,
    });
  }

  private createOutputs(props: StatefulStackProps): void {
    new cdk.CfnOutput(this, "Output", {
      value: "",
    });
  }
}
