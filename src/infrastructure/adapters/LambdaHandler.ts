import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { Session } from "../../core/Session";
import { PersistSessionService } from "../../application/PersistSessionService";
import { Result } from "../../core/ports/SessionRepository";
import { Tracer } from '@aws-lambda-powertools/tracer';

const tracer = new Tracer({ serviceName: 'LambdaHandlerService' });

export class LambdaHandler {
  private persistSessionService: PersistSessionService;

  constructor(persistSessionService: PersistSessionService) {
    this.persistSessionService = persistSessionService;
  }

  @tracer.captureMethod()
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

      const segment = tracer.getSegment();
      const subsegment = segment?.addNewSubsegment('PersistSessionServiceSaveSession');
      const result = await this.persistSessionService.saveSession(sessionToSave);
      subsegment?.close();

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

  @tracer.captureMethod()
  async fetchCourseLifetimeStats(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {
    const userID = event.headers?.Userid || event.headers?.userid || "";
    const courseID = event.headers?.Courseid || event.headers?.courseid || "";

    if (!userID || !courseID) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "UserID and CourseID are required in headers",
          found: false,
        }),
      };
    }

    const segment = tracer.getSegment();
    const subsegment = segment?.addNewSubsegment('PersistSessionServiceFindCourseLifetimeStats');
    const result: Result<{ totalModulesStudied: number; averageScore: number; timeStudied: number }> =
    await this.persistSessionService.findCourseLifetimeStats(userID, courseID);
    
    subsegment?.close();

    if (!result.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: result.error?.message,
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
  }

  @tracer.captureMethod()
  async fetchSession(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {
    const sessionID = event.headers?.Sessionid || event.headers?.sessionid || "";
    const courseID = event.headers?.Courseid || event.headers?.courseid || "";
    const userID = event.headers?.Userid || event.headers?.userid || "";

    if (!sessionID || !courseID || !userID) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "SessionID, UserID, and CourseID are required in headers",
          found: false,
        }),
      };
    }

    const segment = tracer.getSegment();
    const subsegment = segment?.addNewSubsegment('PersistSessionServiceFindSessionByID');
    const session = await this.persistSessionService.findSessionByID(sessionID, courseID, userID);
    subsegment?.close();

    if (!session.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          found: false,
          message: session.error?.message || "Failed to fetch session",
        }),
      };
    }

    if (!session.value) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          found: false,
          message: "Could not find session.",
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        userID: session.value.getUserID(),
        totalModulesStudied: session.value.getTotalModulesStudied(),
        averageScore: session.value.getAverageScore(),
        timeStudied: session.value.getTimeStudied(),
        courseID: session.value.getCourseID(),
        message: "Successfully found session.",
        found: true,
      }),
    };
  }
}
