import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { LambdaHandlerFactory } from "../infrastructure/factories/LambdaHandlerFactory";

const lambdaHandler = LambdaHandlerFactory.create();

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  return lambdaHandler.createSession(event, context);
};
