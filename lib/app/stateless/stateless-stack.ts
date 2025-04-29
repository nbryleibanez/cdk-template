import * as cdk from "aws-cdk-lib";

import { Construct } from "constructs";
import { StatelessStackProps } from "../types";
import { LambdaConstruct } from "./constructs/lambda";
import { ApiGatewayConstruct } from "./constructs/apigateway";

export class StatelessStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StatelessStackProps) {
    super(scope, id, props);

    this.createApiGatewayConstruct(props);
    this.createLambdaConstruct(props);
  }

  private createApiGatewayConstruct(props: StatelessStackProps) {
    new ApiGatewayConstruct(this, `${props.stage}-ApiGateway-Construct`, {
      stage: props.stage,
    });
  }

  private createLambdaConstruct(props: StatelessStackProps) {
    new LambdaConstruct(this, `${props.stage}-Lambda-Construct`, {
      stage: props.stage,
    });
  }
}
