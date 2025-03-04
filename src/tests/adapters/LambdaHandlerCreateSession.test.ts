import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { LambdaHandler } from "../../infrastructure/adapters/LambdaHandler";
import { PersistSessionService } from "../../application/PersistSessionService";
import { Result, SessionRepository, SessionResponseObject } from "../../core/ports/SessionRepository";
import { Session } from "../../core/Session";

class MockPersistSessionService extends PersistSessionService {
  saveSession = jest.fn();
}

class MockSessionRepository implements SessionRepository {
    saveSession = jest.fn(async (session: Session): Promise<Result<void>> => {
        return { ok: true, value: undefined };
    });

    findSessionByID = jest.fn(async (sessionID: string): Promise<Result<SessionResponseObject | null>> => {
        return { ok: true, value: null };
    });

    findCourseLifetimeStats = jest.fn(async function* (userID: string, courseID: string): AsyncGenerator<Result<SessionResponseObject | null>> {
        yield { ok: true, value: null };
    });
}

const validUUID = "934c5159-83ef-4c0e-8198-d5a5a62a34b1";

describe("LambdaHandler - createSession", () => {
  let lambdaHandler: LambdaHandler;
  let mockPersistSessionService: MockPersistSessionService;
  let mockSessionRepository: MockSessionRepository;

  beforeEach(() => {
    mockSessionRepository = new MockSessionRepository();
    mockPersistSessionService = new MockPersistSessionService(mockSessionRepository);
    lambdaHandler = new LambdaHandler(mockPersistSessionService);
  });

  it("should return 201 when session is successfully saved", async () => {
    const mockEvent: APIGatewayEvent = {
      body: JSON.stringify({
        sessionID: validUUID,
        totalModulesStudied: 5,
        averageScore: 90,
        timeStudied: 1200
      }),
      headers: {
        Courseid: validUUID,
        Userid: validUUID 
      },
    } as any;

    const mockContext: Context = {} as Context;

    mockPersistSessionService.saveSession.mockResolvedValue({ ok: true });

    const response: APIGatewayProxyResult = await lambdaHandler.createSession(mockEvent, mockContext);

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual({ message: "Successfully saved session" });
    expect(mockPersistSessionService.saveSession).toHaveBeenCalledTimes(1);
    expect(mockPersistSessionService.saveSession).toHaveBeenCalledWith(
      expect.objectContaining({
        sessionID: validUUID,
        totalModulesStudied: 5,
        averageScore: 90,
        timeStudied: 1200,
        courseID: validUUID,
        userID: validUUID 
      })
    );
  });

  it("should return 500 when PersistSessionService fails to save the session", async () => {
    const mockEvent: APIGatewayEvent = {
      body: JSON.stringify({
        sessionID: validUUID,
        totalModulesStudied: 5,
        averageScore: 90,
        timeStudied: 1200
      }),
      headers: {
        Courseid: validUUID,
        Userid: validUUID 
      },
    } as any;

    const mockContext: Context = {} as Context;

    mockSessionRepository.saveSession.mockResolvedValue({
      ok: false,
      error: new Error("Database error")
    });
    mockPersistSessionService.saveSession.mockResolvedValue({
      ok: false,
      error: new Error("Database error")
    });

    const response: APIGatewayProxyResult = await lambdaHandler.createSession(mockEvent, mockContext);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ message: "Database error" });
    expect(mockPersistSessionService.saveSession).toHaveBeenCalledTimes(1);
  });

  it("should return 400 when request body is missing or invalid", async () => {
    const mockEvent: APIGatewayEvent = {
      body: null,
      headers: {},
    } as any;

    const mockContext: Context = {} as Context;

    mockPersistSessionService.saveSession.mockResolvedValue({
      ok: false,
      error: new Error("Invalid request")
    })

    const response: APIGatewayProxyResult = await lambdaHandler.createSession(mockEvent, mockContext);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toHaveProperty("error", "Invalid SessionID received: undefined");
    expect(mockPersistSessionService.saveSession).not.toHaveBeenCalled();
  });
});
