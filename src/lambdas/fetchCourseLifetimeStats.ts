import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { Session, SessionDataObject } from "../core/Session";
import { SessionRepository } from "../infrastructure/repositories/SessionRepository";
import { PersistSessionService } from "../application/PersistSessionService";
import { PostgresSessionRepository } from "../infrastructure/repositories/PostgresSessionRepository";

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {

    const persistSessionService = new PersistSessionService(new PostgresSessionRepository());
    const foundSessions: SessionDataObject[] = [];
      for await (const session of persistSessionService.findCourseLifetimeStats(event.headers?.Userid || "", event.headers?.Courseid || "")) {
        if(session){
          foundSessions.push(session.getSessionJSONData());
        }
    }

   return {
    statusCode: 200,
    body: JSON.stringify({ 
      message: "Successfully found sessions", 
      found: true,
      ...foundSessions
     }),
  }; 
};
