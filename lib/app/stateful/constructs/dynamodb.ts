import { Construct } from "constructs";

interface DynamoDbConstructProps {}

export class DynamoDbConstruct extends Construct {
  constructor(scope: Construct, id: string, props: DynamoDbConstructProps) {
    super(scope, id);
  }
}
