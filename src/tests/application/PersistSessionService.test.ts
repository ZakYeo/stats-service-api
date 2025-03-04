import { PersistSessionService } from "../../application/PersistSessionService";
import { SessionRepository, SessionResponseObject, Result } from "../../core/ports/SessionRepository";
import { Session } from "../../core/Session";


const validUUID = "934c5159-83ef-4c0e-8198-d5a5a62a34b1";

class MockSessionRepository implements SessionRepository {
    constructor(){}

    public async saveSession(session: Session): Promise<Result<void>> {
        return { ok: true, value: undefined };
    }

    public async findSessionByID(sessionID: string): Promise<Result<SessionResponseObject | null>> {
        return { ok: true, value: null };
    }

    async *findCourseLifetimeStats(userID: string, courseID: string): AsyncGenerator<Result<SessionResponseObject | null>> {
        yield { ok: true, value: null };
    }
}

describe('Persist Session Service', () => {
  it('Successfully saves an incoming session', async () => {
    const mockSessionRepository = new MockSessionRepository();
    const saveSessionSpy = jest.spyOn(mockSessionRepository, 'saveSession');

    const sessionPersistService = new PersistSessionService(mockSessionRepository);
    const sessionToSave = Session.create({
        sessionID: validUUID,
        totalModulesStudied: 1,
        averageScore: 1,
        timeStudied: 1,
        courseID: validUUID,
        userID: validUUID 
    });

    await expect(sessionPersistService.saveSession(sessionToSave)).resolves.toStrictEqual({ok: true, value: undefined});
    expect(saveSessionSpy).toHaveBeenCalledWith(sessionToSave);
  });


  it('Prevents saving of duplicate sessionIDs', async () => {

    const mockSessionRepository = new MockSessionRepository();
    const saveSessionSpy = jest.spyOn(mockSessionRepository, 'saveSession');
    jest.spyOn(mockSessionRepository, 'findSessionByID').mockResolvedValueOnce(
    {
      ok: true,
      value: {
        sessionID: validUUID,
        totalModulesStudied: 1,
        averageScore: 1,
        timeStudied: 1,
        courseID: validUUID,
        userID: validUUID
      }
    }
  );

    const sessionPersistService = new PersistSessionService(mockSessionRepository);
    const sessionToSave = Session.create({
        sessionID: validUUID,
        totalModulesStudied: 1,
        averageScore: 1,
        timeStudied: 1,
        courseID: validUUID,
        userID: validUUID 
    });

    const result = await sessionPersistService.saveSession(sessionToSave);
    expect(result.ok).toBe(false);
    if(!result.ok){
      expect(result.error).toBeInstanceOf(Error);
      expect(result.error.message).toBe("Cannot save: SessionID already exists.");
      expect(saveSessionSpy).not.toHaveBeenCalled();
    }

  });

  it('Returns null when finding a session that does not exist', async () => {
    const mockSessionRepository = new MockSessionRepository();
    const sessionPersistService = new PersistSessionService(mockSessionRepository);
    const session = await sessionPersistService.findSessionByID(validUUID, validUUID, validUUID);
    if(session.ok){
      expect(session.value).toBeNull();
    }else{
      expect(false)
    }
  });

  it('Throws an error if the repository fails while saving', async () => {
    const mockSessionRepository = new MockSessionRepository();
    jest.spyOn(mockSessionRepository, 'saveSession').mockRejectedValueOnce(new Error('Database failure'));

    const sessionPersistService = new PersistSessionService(mockSessionRepository);
    const sessionToSave = Session.create({
        sessionID: validUUID,
        totalModulesStudied: 1,
        averageScore: 90,
        timeStudied: 120,
        courseID: validUUID,
        userID: validUUID
    });

    await expect(sessionPersistService.saveSession(sessionToSave))
        .rejects.toThrow('Database failure');
    });

  it("findCourseLifetimeStats should return aggregated / summarised course values", async () => {
    class MockSessionRepositoryForLifetimeStats implements SessionRepository {
      private sessions: SessionResponseObject[] = [
        {
          sessionID: "934c5159-83ef-4c0e-8198-d5a5a62a34b1",
          courseID: "14a84793-9b2c-478c-bd40-c8eff8518f71",
          userID: "3805a7d2-4c95-45b1-9ff8-723ac66ad677",
          totalModulesStudied: 1,
          averageScore: 90,
          timeStudied: 120,
        },
        {
          sessionID: "2d9b8f86-7f43-4b3f-a5cb-6d1a29d23a56",
          courseID: "14a84793-9b2c-478c-bd40-c8eff8518f71",
          userID: "3805a7d2-4c95-45b1-9ff8-723ac66ad677",
          totalModulesStudied: 8,
          averageScore: 89,
          timeStudied: 110,
        },
        {
          sessionID: "5abf4d2c-3f64-47c2-bd95-30f7adf5b0cb",
          courseID: "14a84793-9b2c-478c-bd40-c8eff8518f71",
          userID: "3805a7d2-4c95-45b1-9ff8-723ac66ad677",
          totalModulesStudied: 5,
          averageScore: 45,
          timeStudied: 200,
        },
        {
          sessionID: "d3f6ab7e-4d3b-4a8c-b9a5-6f5a2d13c8d2",
          courseID: "3d2a5b3a-c345-4879-93ab-c5c68b7bb3f4",
          userID: "d2c36eaa-f14b-4ff5-aef2-f587b60f5b71",
          totalModulesStudied: 8,
          averageScore: 30,
          timeStudied: 180,
        },
      ];

      async *findCourseLifetimeStats(
        userID: string,
        courseID: string
      ): AsyncGenerator<Result<SessionResponseObject | null>> {
        for (const session of this.sessions) {
          if (session.userID === userID && session.courseID === courseID) {
            yield { ok: true, value: session };
          }
        }
      }

      public async saveSession(session: Session): Promise<Result<void>> {
        return { ok: true, value: undefined };
      }

      public async findSessionByID(
        sessionID: string
      ): Promise<Result<SessionResponseObject | null>> {
        return { ok: true, value: null };
      }
    }

    const mockRepository = new MockSessionRepositoryForLifetimeStats();
    const service = new PersistSessionService(mockRepository);

    const result = await service.findCourseLifetimeStats(
      "3805a7d2-4c95-45b1-9ff8-723ac66ad677",
      "14a84793-9b2c-478c-bd40-c8eff8518f71"
    );

    expect(result.ok).toBe(true);

    if (result.ok) {
      const aggregatedStats = result.value;

      expect(aggregatedStats).toHaveProperty("totalModulesStudied", 14);
      expect(aggregatedStats).toHaveProperty("averageScore", (90 + 89 + 45) / 3);
      expect(aggregatedStats).toHaveProperty("timeStudied", 120 + 110 + 200);
    }
  });



});
