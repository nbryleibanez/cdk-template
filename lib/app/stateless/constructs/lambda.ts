import { Construct } from "constructs";

interface LambdaConstructProps {}

export class LambdaConstruct extends Construct {
  constructor(scope: Construct, id: string, props: LambdaConstructProps) {
    super(scope, id);

    this.createLambdaFunction(props);
  }

  private createLambdaFunction(props: LambdaConstructProps) {}
}
