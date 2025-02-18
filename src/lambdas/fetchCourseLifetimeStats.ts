import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { Result } from "../infrastructure/repositories/SessionRepository";
import { PersistSessionService } from "../application/PersistSessionService";
import { PostgresSessionRepository } from "../infrastructure/repositories/PostgresSessionRepository";

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {

  const userID = event.headers?.Userid || event.headers?.userid || "";
  const courseID = event.headers?.Courseid || event.headers?.courseid || "";

  const persistSessionService = new PersistSessionService(new PostgresSessionRepository());
  const result: Result<{ totalModulesStudied: number; averageScore: number; timeStudied: number }> =
    await persistSessionService.findCourseLifetimeStats(userID, courseID);

  if (!result.ok) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: result.error.message,
        found: false,
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Successfully retrieved course lifetime stats",
      found: true,
      totalModulesStudied: result.value.totalModulesStudied,
      averageScore: result.value.averageScore,
      timeStudied: result.value.timeStudied,
    }),
  };
};