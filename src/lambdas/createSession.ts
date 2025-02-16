import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { Session } from "../core/Session";
import { SessionRepository } from "../infrastructure/repositories/SessionRepository";
import { PersistSessionService } from "../application/PersistSessionService";
import { PostgresSessionRepository } from "../infrastructure/repositories/PostgresSessionRepository";

/* TODO: Mock service for now. Implement database layer later */
class MockSessionRepository implements SessionRepository {
    constructor(){}

    public saveSession(session: Session): Promise<void>{
      console.log("Saving session");
        return Promise.resolve();
    }

    public findSessionByID(sessionID: string, courseID: string, userID: string): Promise<Session | null>{
        return Promise.resolve(null);
    }

    async *findCourseLifetimeStats(userID: string, courseID: string): AsyncGenerator<Session | null> {
      return;
    }
}

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
