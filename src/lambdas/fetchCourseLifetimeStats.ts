import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { Result } from "../infrastructure/repositories/SessionRepository";
import { Session } from "../core/Session";
import { PersistSessionService } from "../application/PersistSessionService";
import { PostgresSessionRepository } from "../infrastructure/repositories/PostgresSessionRepository";

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {

  const userID = event.headers?.Userid || event.headers?.userid || "";
  const courseID = event.headers?.Courseid || event.headers?.courseid || "";

  const persistSessionService = new PersistSessionService(new PostgresSessionRepository());
  const foundSessions: Result<Session[]> = await persistSessionService.findCourseLifetimeStats(userID, courseID);

  if (!foundSessions.ok) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: foundSessions.error.message, 
        found: false,
      }),
    };
  }

  const sessionDataObjects = foundSessions.value.map((session: Session) => session.getSessionJSONData());

  return {
    statusCode: 200,
    body: JSON.stringify({ 
      message: sessionDataObjects.length > 0 ? "Successfully found sessions" : "No sessions found",
      found: sessionDataObjects.length > 0,
      sessions: sessionDataObjects
    }),
  };
};
