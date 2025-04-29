import { Construct } from "constructs";

interface ApiGatewayConstructProps {
  stage: string;
}

export class ApiGatewayConstruct extends Construct {
  public apiGateway;

  constructor(scope: Construct, id: string, props: ApiGatewayConstructProps) {
    super(scope, id);

    this.createApiGateway(props);
  }

  private createApiGateway(props: ApiGatewayConstructProps) {}
}
