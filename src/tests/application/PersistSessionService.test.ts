import { PersistSessionService } from "../../application/PersistSessionService";
import { SessionRepository, SessionResponseObject, Result } from "../../infrastructure/repositories/SessionRepository";
import { Session } from "../../core/Session";

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
        sessionID: "session-123",
        totalModulesStudied: 1,
        averageScore: 1,
        timeStudied: 1,
        courseID: "course-123",
        userID: "user-123"
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
        sessionID: "session-123",
        totalModulesStudied: 1,
        averageScore: 1,
        timeStudied: 1,
        courseID: "course-123",
        userID: "user-123"
      }
    }
  );

    const sessionPersistService = new PersistSessionService(mockSessionRepository);
    const sessionToSave = Session.create({
        sessionID: "session-123",
        totalModulesStudied: 1,
        averageScore: 1,
        timeStudied: 1,
        courseID: "course-123",
        userID: "user-123"
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
    const session = await sessionPersistService.findSessionByID('nonexistent-session', "course-123", "userID");
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
        sessionID: "session-456",
        totalModulesStudied: 1,
        averageScore: 90,
        timeStudied: 120,
        courseID: "course-123",
        userID: "user-123"
    });

    await expect(sessionPersistService.saveSession(sessionToSave))
        .rejects.toThrow('Database failure');
    });

   it("findCourseLifetimeStats should return aggregated / summarised course values", async () => {
      class MockSessionRepositoryForLifetimeStats implements SessionRepository {
        private sessions: SessionResponseObject[] = [
          {
            sessionID: "session-456",
            courseID: "course-123",
            userID: "user-123",
            totalModulesStudied: 1,
            averageScore: 90,
            timeStudied: 120,
          },
          {
            sessionID: "session-457",
            courseID: "course-123",
            userID: "user-123",
            totalModulesStudied: 8,
            averageScore: 89,
            timeStudied: 110,
          },
          {
            sessionID: "session-458",
            courseID: "course-123",
            userID: "user-123",
            totalModulesStudied: 5,
            averageScore: 45,
            timeStudied: 200,
          },
          {
            sessionID: "session-999",
            courseID: "course-124",
            userID: "user-124",
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

      const result = await service.findCourseLifetimeStats("user-123", "course-123");

      expect(result.ok).toBe(true);

      if (result.ok) {
        const aggregatedStats = result.value; 

        expect(aggregatedStats).toHaveProperty("totalModulesStudied", 14); 
        expect(aggregatedStats).toHaveProperty("averageScore", (90 + 89 + 45) / 3);
        expect(aggregatedStats).toHaveProperty("timeStudied", 120 + 110 + 200);
      }
  }); 



});
