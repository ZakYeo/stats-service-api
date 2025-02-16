import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { Session } from "../core/Session";
import { SessionRepository } from "../infrastructure/repositories/SessionRepository";
import { PersistSessionService } from "../application/PersistSessionService";
import { PostgresSessionRepository } from "../infrastructure/repositories/PostgresSessionRepository";

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
    /* Fetch a session from sessionID, courseID & userID */
    const persistSessionService = new PersistSessionService(new PostgresSessionRepository());
    const session = await persistSessionService.findSessionByID(
        event.headers?.Sessionid || "", 
        event.headers?.Courseid || "", 
        event.headers?.Userid || ""
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
