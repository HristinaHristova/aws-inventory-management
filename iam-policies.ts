import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class LambdaIamPolicies {
  public static createFirstLambdaRole(scope: Construct, tableName: string, lambdaFunctionName: string): iam.Role {
    const role = new iam.Role(scope, "data-entry", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    // Allow PutItem in DynamoDB
    role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["dynamodb:PutItem"],
        resources: [`arn:aws:dynamodb:${scope.node.tryGetContext("region")}:${scope.node.tryGetContext("accountId")}:table/${tableName}`],
      })
    );

    // Allow CloudWatch Logs
    role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["logs:CreateLogGroup"],
        resources: [`arn:aws:logs:${scope.node.tryGetContext("region")}:${scope.node.tryGetContext("accountId")}:*`],
      })
    );

    role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["logs:CreateLogStream", "logs:PutLogEvents"],
        resources: [`arn:aws:logs:${scope.node.tryGetContext("region")}:${scope.node.tryGetContext("accountId")}:log-group:/aws/lambda/${lambdaFunctionName}:*`],
      })
    );

    return role;
  }

  public static createSecondLambdaRole(scope: Construct, tableName: string, lambdaFunctionName: string): iam.Role {
    const role = new iam.Role(scope, "query", {
      assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    });

    // Allow GetItem in DynamoDB
    role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["dynamodb:GetItem"],
        resources: [`arn:aws:dynamodb:${scope.node.tryGetContext("region")}:${scope.node.tryGetContext("accountId")}:table/${tableName}`],
      })
    );

    // Allow CloudWatch Logs
    role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["logs:CreateLogGroup"],
        resources: [`arn:aws:logs:${scope.node.tryGetContext("region")}:${scope.node.tryGetContext("accountId")}:*`],
      })
    );

    role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["logs:CreateLogStream", "logs:PutLogEvents"],
        resources: [`arn:aws:logs:${scope.node.tryGetContext("region")}:${scope.node.tryGetContext("accountId")}:log-group:/aws/lambda/${lambdaFunctionName}:*`],
      })
    );

    return role;
  }
}
