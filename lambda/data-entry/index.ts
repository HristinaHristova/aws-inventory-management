import { DynamoDB } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

const TABLE_NAME = process.env.TABLE_NAME!;
const dynamoDb = new DynamoDB.DocumentClient();

export const handler = async (): Promise<void> => {
  try {
    const newItem = {
      productId: uuidv4(),
      shortDescription: "Sample product description",
      tag: "clothes",
      cost: Math.floor(Math.random() * 100) + 1,
      createdAt: new Date().toISOString(),
    };

    await dynamoDb.put({
      TableName: TABLE_NAME,
      Item: newItem,
    }).promise();

    console.log("New item inserted:", newItem);
  } catch (error) {
    console.error("Error inserting item:", error);
    throw new Error("Failed to insert item.");
  }
};
