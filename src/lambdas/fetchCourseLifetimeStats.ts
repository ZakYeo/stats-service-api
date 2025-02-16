import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { Session, SessionDataObject } from "../core/Session";
import { SessionRepository } from "../infrastructure/repositories/SessionRepository";
import { PersistSessionService } from "../application/PersistSessionService";

/* TODO: Mock service for now. Implement database layer later */
class MockSessionRepositoryForLifetimeCourseStats implements SessionRepository {
    private sessions: Session[] = [
        Session.create({
        sessionID: "session-456",
        totalModulesStudied: 1,
        averageScore: 90,
        timeStudied: 120,
        courseID: "course-123",
        userID: "user-123"
    }),
    Session.create({
        sessionID: "session-457",
        totalModulesStudied: 8,
        averageScore: 89,
        timeStudied: 110,
        courseID: "course-123",
        userID: "user-123"
    })
    ];
    constructor(){}

    public saveSession(session: Session): Promise<void>{
        this.sessions.push(session);
        return Promise.resolve();
    }

    public findSessionByID(sessionID: string): Promise<Session | null>{
        return Promise.resolve(null);
    }

    async *findCourseLifetimeStats(userID: string, courseID: string): AsyncGenerator<Session | null> {
      for(const session of this.sessions){
        if(session.getUserID() === userID && session.getCourseID() === courseID){
          yield session;
        }
      }
      yield null;
    }
}

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {

    const persistSessionService = new PersistSessionService(new MockSessionRepositoryForLifetimeCourseStats());
    const foundSessions: SessionDataObject[] = [];
      for await (const session of persistSessionService.findCourseLifetimeStats("user-123", "course-123")) {
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
