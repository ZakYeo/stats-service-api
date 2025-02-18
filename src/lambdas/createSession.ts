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
    courseID: event.headers?.Courseid || event.headers?.courseid || "",
    userID: event.headers?.Userid || event.headers?.userid || ""
  });
  const persistSessionService = new PersistSessionService(new PostgresSessionRepository());
  const result = await persistSessionService.saveSession(sessionToSave);

  if (!result.ok) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: result.error.message,
      }),
    };
  }

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: "Successfully saved session",
    }),
  };

};
