import { PersistSessionService } from "../../application/PersistSessionService";
import { SessionRepository, SessionResponseObject } from "../../infrastructure/repositories/SessionRepository";
import { Session } from "../../core/Session";

class MockSessionRepository implements SessionRepository {
    constructor(){}

    public saveSession(session: Session): Promise<void>{
        return Promise.resolve();
    }

    public findSessionByID(sessionID: string): Promise<SessionResponseObject | null>{
        return Promise.resolve(null);
    }

    async *findCourseLifetimeStats(userID: string, courseID: string): AsyncGenerator<SessionResponseObject | null> {
      return;
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

    await expect(sessionPersistService.saveSession(sessionToSave)).resolves.toBeUndefined();
    expect(saveSessionSpy).toHaveBeenCalledWith(sessionToSave);
  });


  it('Prevents saving of duplicate sessionIDs', async () => {

    const mockSessionRepository = new MockSessionRepository();
    const saveSessionSpy = jest.spyOn(mockSessionRepository, 'saveSession');
    jest.spyOn(mockSessionRepository, 'findSessionByID').mockResolvedValueOnce(
    {
      sessionID: "session-123",
      totalModulesStudied: 1,
      averageScore: 1,
      timeStudied: 1,
      courseID: "course-123",
      userID: "user-123"
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
    await expect(sessionPersistService.saveSession(sessionToSave))
        .rejects.toThrow('Cannot save: SessionID already exists.');
    expect(saveSessionSpy).not.toHaveBeenCalled();

  });

  it('Returns null when finding a session that does not exist', async () => {
    const mockSessionRepository = new MockSessionRepository();
    const sessionPersistService = new PersistSessionService(mockSessionRepository);
    const session = await sessionPersistService.findSessionByID('nonexistent-session', "course-123", "userID");
    expect(session).toBeNull();
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

it('findCourseLifetimeStats should return an array of Session objects', async () => {
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

      async *findCourseLifetimeStats(userID: string, courseID: string): AsyncGenerator<SessionResponseObject | null> {
        for (const session of this.sessions) {
          if (session.userID === userID && session.courseID === courseID) {
            yield session;
          }
        }
      }

      public saveSession(session: Session): Promise<void> {
        return Promise.resolve();
      }

      public findSessionByID(sessionID: string): Promise<SessionResponseObject | null> {
        return Promise.resolve(null);
      }
    }

    const mockRepository = new MockSessionRepositoryForLifetimeStats();
    const service = new PersistSessionService(mockRepository);

    const sessions = await service.findCourseLifetimeStats("user-123", "course-123");

    expect(sessions).toHaveLength(3);
    expect(sessions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ sessionID: "session-456" }),
        expect.objectContaining({ sessionID: "session-457" }),
        expect.objectContaining({ sessionID: "session-458" }),
      ])
    );
  });

});
