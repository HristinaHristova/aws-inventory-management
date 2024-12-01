import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class InventoryManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Table
    const table = new dynamodb.Table(this, "InventoryTable", {
      partitionKey: { name: "productId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Data Entry Lambda
    const dataEntryLambda = new lambda.Function(this, "DataEntryLambda", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda/data-entry/dist"),
      handler: "index.handler",
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantWriteData(dataEntryLambda);

    // EventBridge Rule
    const rule = new events.Rule(this, "DataEntrySchedule", {
      schedule: events.Schedule.rate(cdk.Duration.minutes(5)),
    });
    rule.addTarget(new targets.LambdaFunction(dataEntryLambda));

    // SNS Topic
    const topic = new sns.Topic(this, "InventoryAlertTopic");
    topic.addSubscription(new subscriptions.EmailSubscription("your-email@example.com"));

    // Query Lambda
    const queryLambda = new lambda.Function(this, "QueryLambda", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("lambda/query/dist"),
      handler: "index.handler",
      environment: {
        TABLE_NAME: table.tableName,
      },
    });
    table.grantReadData(queryLambda);

    // API Gateway
    const api = new apigateway.RestApi(this, "InventoryApi");
    const items = api.root.addResource("items");
    items.addMethod("POST", new apigateway.LambdaIntegration(queryLambda));
  }
}
