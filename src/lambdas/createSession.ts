import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { Session } from "../core/Session";
import { SessionRepository } from "../infrastructure/repositories/SessionRepository";
import { PersistSessionService } from "../application/PersistSessionService";
import { PostgresSessionRepository } from "../infrastructure/repositories/PostgresSessionRepository";

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  /* Persist incoming stats */
  const parsedBody = JSON.parse(event.body || "{}");
  const sessionToSave = Session.create({
    sessionID: parsedBody?.sessionID,
    totalModulesStudied: parsedBody?.totalModulesStudied,
    averageScore: parsedBody?.averageScore,
    timeStudied: parsedBody?.timeStudied,
    courseID: event.headers?.Courseid || "",
    userID: event.headers.Userid || ""
  });
  const persistSessionService = new PersistSessionService(new PostgresSessionRepository());
  await persistSessionService.saveSession(sessionToSave);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello, World!" }),
  };
};
