import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { Session } from "../core/Session";
import { SessionRepository } from "../infrastructure/repositories/SessionRepository";
import { PersistSessionService } from "../application/PersistSessionService";

/* TODO: Mock service for now. Implement database layer later */
class MockSessionRepository implements SessionRepository {
    constructor(){}

    public saveSession(session: Session): Promise<void>{
      console.log("Saving session");
        return Promise.resolve();
    }

    public findSessionByID(sessionID: string, courseID: string, userID: string): Promise<Session | null>{
        const mockSession = Session.create({
            sessionID: sessionID,
            totalModulesStudied: 1,
            averageScore: 1,
            timeStudied: 1,
            courseID: courseID,
            userID: userID
        })
        return Promise.resolve(mockSession);
    }
}

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
    /* Fetch a session from sessionID, courseID & userID */


    const persistSessionService = new PersistSessionService(new MockSessionRepository());
    const session = await persistSessionService.findSessionByID(
        event.headers?.sessionID || "", 
        event.headers?.courseID || "", 
        event.headers?.userID || ""
    )

    let response;

    if(session){
        response = {
            statusCode: 200,
            body: JSON.stringify({
                "userID": session.getUserID(),
                "totalModulesStudied": session.getTotalModulesStudied(),
                "averageScore": session.getAverageScore(),
                "timeStudied": session.getTimeStudied(),
                "courseID": session.getCourseID(),
                "message": "Successfully found session.",
                "found": true
            })
        }
    } else {
        response = {
            statusCode: 200,
            body: JSON.stringify({
                "message": "Could not find session.",
                "found": false
            })
        }
    }

    return response;
};
