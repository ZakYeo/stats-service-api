import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  console.log("Received event:", JSON.stringify(event));

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello, World!" }),
  };
};