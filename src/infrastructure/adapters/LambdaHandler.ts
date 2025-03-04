import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { Session } from "../../core/Session";
import { PersistSessionService } from "../../application/PersistSessionService";

export class LambdaHandler {
  private persistSessionService: PersistSessionService;

  constructor(persistSessionService: PersistSessionService) {
    this.persistSessionService = persistSessionService;
  }

  async createSession(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {
      const parsedBody = JSON.parse(event.body || "{}");
      let sessionToSave;
      try{
        sessionToSave = Session.create({
          sessionID: parsedBody?.sessionID,
          totalModulesStudied: parsedBody?.totalModulesStudied,
          averageScore: parsedBody?.averageScore,
          timeStudied: parsedBody?.timeStudied,
          courseID: event.headers?.Courseid || event.headers?.courseid || "",
          userID: event.headers?.Userid || event.headers?.userid || ""
        });
      }catch(error){
        return {
          statusCode: 400,
          body: JSON.stringify({error: error instanceof Error ? error.message : new Error(String(error))})
        }

      }

      const result = await this.persistSessionService.saveSession(sessionToSave);

      if (!result.ok) {
        return {
          statusCode: 500,
          body: JSON.stringify({ message: result.error?.message }),
        };
      }

      return {
        statusCode: 201,
        body: JSON.stringify({ message: "Successfully saved session" }),
      };
  }
}
