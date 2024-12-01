import { DynamoDB } from "aws-sdk";

const TABLE_NAME = process.env.TABLE_NAME!;
const dynamoDb = new DynamoDB.DocumentClient();

interface QueryEvent {
  body: string;
}

interface QueryResponse {
  statusCode: number;
  body: string;
}

export const handler = async (event: QueryEvent): Promise<QueryResponse> => {
  try {
    const requestBody = JSON.parse(event.body);
    const { productId } = requestBody;

    if (!productId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing productId in request body" }),
      };
    }

    // Get the item details from DynamoDB
    const result = await dynamoDb
      .get({
        TableName: TABLE_NAME,
        Key: { productId },
      })
      .promise();

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Item not found" }),
      };
    }

    // Check and update the stock
    const currentStock = result.Item.stock || 0;

    if (currentStock < 10) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Insufficient stock to remove 10 items",
        }),
      };
    }

    await dynamoDb
      .update({
        TableName: TABLE_NAME,
        Key: { productId },
        UpdateExpression: "SET stock = stock - :decrement",
        ConditionExpression: "stock >= :decrement",
        ExpressionAttributeValues: {
          ":decrement": 10,
        },
      })
      .promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Stock decremented by 10",
        productId,
        remainingStock: currentStock - 10,
      }),
    };
  } catch (error) {
    console.error("Error updating stock:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to process the request" }),
    };
  }
};
