import { Construct } from "constructs";

interface EcsConstructProps {}

export class EcsConstruct extends Construct {
  constructor(scope: Construct, id: string, props: EcsConstructProps) {
    super(scope, id);
  }
}
