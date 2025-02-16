import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { Session } from "../core/Session";
import { PersistSessionService } from "../application/PersistSessionService";
import { PostgresSessionRepository } from "../infrastructure/repositories/PostgresSessionRepository";

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {


  const userID = event.headers?.Userid || "";
  const courseID = event.headers?.Courseid || "";

  const persistSessionService = new PersistSessionService(new PostgresSessionRepository());
  const foundSessions: Session[] = await persistSessionService.findCourseLifetimeStats(userID, courseID);
  const sessionDataObjects = foundSessions.map((session) => session.getSessionJSONData());


   return {
    statusCode: 200,
    body: JSON.stringify({ 
      message: "Successfully found sessions", 
      found: true,
      ...sessionDataObjects
     }),
  }; 
};
