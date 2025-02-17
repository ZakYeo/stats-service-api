import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
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
    if(!session.ok){
        return {
            statusCode: 500,
            body: JSON.stringify({
                found: false,
                message: session.error.message
            })

        }
    }
    if(!session.value){
        return {
            statusCode: 500,
            body: JSON.stringify({
                found: false,
                message: "Could not find session."
            })
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify({
            "userID": session.value.getUserID(),
            "totalModulesStudied": session.value.getTotalModulesStudied(),
            "averageScore": session.value.getAverageScore(),
            "timeStudied": session.value.getTimeStudied(),
            "courseID": session.value.getCourseID(),
            "message": "Successfully found session.",
            "found": true
        })
    }

};
