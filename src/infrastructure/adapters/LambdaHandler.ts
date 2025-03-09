import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { Session } from "../../core/Session";
import { PersistSessionService } from "../../application/PersistSessionService";
import { Result } from "../../core/ports/SessionRepository";
import { Tracer } from '@aws-lambda-powertools/tracer';
import { Logger } from '@aws-lambda-powertools/logger';
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics';
import prisma from "../../core/persistence/prisma";

const tracer = new Tracer({ serviceName: 'LambdaHandlerTracerService' });
const logger = new Logger({ serviceName: 'LambdaHandlerLoggerService' });
const metrics = new Metrics({ namespace: 'LambdaHandlerMetrics' });

export class LambdaHandler {
  private persistSessionService: PersistSessionService;

  constructor(persistSessionService: PersistSessionService) {
    this.persistSessionService = persistSessionService;
  }

  @tracer.captureMethod()
  async createSession(event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> {
      logger.debug(`Lambda Invoked: `, { event })
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
        logger.error(`Error occurred when creating Session object: `, { error })
        metrics.addMetric('CreateSessionSessionObjectCreationFailure', MetricUnit.Count, 1);
        metrics.publishStoredMetrics();
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
        logger.error(`Error occurred when saving session: `, { ...result.error })
        metrics.addMetric('CreateSessionPersistSessionServiceSaveSessionFailure', MetricUnit.Count, 1);
        metrics.publishStoredMetrics();
        return {
          statusCode: 500,
          body: JSON.stringify({ message: result.error?.message }),
        };
      }

      logger.debug(`Successfully saved session: ${parsedBody?.sessionID}`)
      metrics.addMetric('CreateSessionSuccess', MetricUnit.Count, 1);
      metrics.publishStoredMetrics();
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
      logger.debug(`Error occurred when parsing userID or courseID from headers`)
      metrics.addMetric('FetchCourseLifetimeStatsInvalidHeadersFailure', MetricUnit.Count, 1);
      metrics.publishStoredMetrics();
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
      logger.debug(`Error occurred when fetching course lifetimestats: `, { ...result.error })
      metrics.addMetric('FetchCourseLifetimeStatsPersistSessionServiceFailure', MetricUnit.Count, 1);
      metrics.publishStoredMetrics();
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: result.error?.message,
          found: false,
        }),
      };
    }


    logger.debug(`Successfully fetched lifetime course stats for courseID: ${courseID}. userID: ${userID}`)
    metrics.addMetric('FetchCourseLifetimeStatsSuccess', MetricUnit.Count, 1);
    metrics.publishStoredMetrics();
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
      logger.debug(`Error occurred when parsing userID or courseID or sessionID from headers`)
      metrics.addMetric('FetchSessionInvalidHeadersFailure', MetricUnit.Count, 1);
      metrics.publishStoredMetrics();
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
      logger.debug(`Error occurred when fetching Session: `, { ...session.error })
      metrics.addMetric('FindSessionByIDPersistSessionServiceFailure', MetricUnit.Count, 1);
      metrics.publishStoredMetrics();
      return {
        statusCode: 500,
        body: JSON.stringify({
          found: false,
          message: session.error?.message || "Failed to fetch session",
        }),
      };
    }

    if (!session.value) {
      logger.debug(`Error occurred when fetching Session: Could not find session: ${sessionID}` )
      metrics.addMetric('FindSessionByIDPersistSessionServiceSessionNotFoundFailure', MetricUnit.Count, 1);
      metrics.publishStoredMetrics();
      return {
        statusCode: 404,
        body: JSON.stringify({
          found: false,
          message: "Could not find session.",
        }),
      };
    }

    logger.debug(`Successfully fetched session for courseID: ${courseID}. userID: ${userID}. SessionID: ${sessionID}`)
    metrics.addMetric('FetchSessionSuccess', MetricUnit.Count, 1);
    metrics.publishStoredMetrics();
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
