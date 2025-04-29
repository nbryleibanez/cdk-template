import * as cdk from "aws-cdk-lib";

import { Construct } from "constructs";
import { GlobalStackProps } from "../types";

export class GlobalStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: GlobalStackProps) {
    super(scope, id, props);

    this.createOutputs(props);
  }

  private createOutputs(props: GlobalStackProps): void {
    new cdk.CfnOutput(this, "Output", {
      value: "",
    });
  }
}
