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

    const result = await dynamoDb.get({
      TableName: TABLE_NAME,
      Key: { productId },
    }).promise();

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Item not found" }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ item: result.Item }),
    };
  } catch (error) {
    console.error("Error retrieving item:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to retrieve item" }),
    };
  }
};
