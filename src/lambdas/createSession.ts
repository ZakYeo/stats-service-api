import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { LambdaHandlerFactory } from "../infrastructure/factories/LambdaHandlerFactory";
import { Tracer } from '@aws-lambda-powertools/tracer';
import type { LambdaInterface } from '@aws-lambda-powertools/commons/types';

const tracer = new Tracer({ serviceName: 'CreateSessionService' });
const lambdaHandler = LambdaHandlerFactory.create();


class Lambda implements LambdaInterface {
  @tracer.captureLambdaHandler()
  public async handler(_event: APIGatewayEvent, _context: Context): Promise<APIGatewayProxyResult> {
    return await lambdaHandler.createSession(_event, _context);
  }
}

const handlerClass = new Lambda();
export const handler = handlerClass.handler.bind(handlerClass);