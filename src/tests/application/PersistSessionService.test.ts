import { PersistSessionService } from "../../application/PersistSessionService";
import { SessionRepository } from "../../infrastructure/repositories/SessionRepository";
import { Session } from "../../core/Session";

class MockSessionRepository implements SessionRepository {
    constructor(){}

    public saveSession(session: Session): Promise<void>{
        return Promise.resolve();
    }

    public findSessionByID(sessionID: string): Promise<Session | null>{
        return Promise.resolve(null);
    }

    async *findCourseLifetimeStats(userID: string, courseID: string): AsyncGenerator<Session | null> {
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
    Session.create({
      sessionID: "session-123",
      totalModulesStudied: 1,
      averageScore: 1,
      timeStudied: 1,
      courseID: "course-123",
      userID: "user-123"
    })
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

  it('Finds all course lifetime stats', async () => {
    class MockSessionRepositoryForLifetimeCourseStats implements SessionRepository {
        private sessions: Session[] = [];
        constructor(){}

        public saveSession(session: Session): Promise<void>{
            this.sessions.push(session);
            return Promise.resolve();
        }

        public findSessionByID(sessionID: string): Promise<Session | null>{
            return Promise.resolve(null);
        }

        async *findCourseLifetimeStats(userID: string, courseID: string): AsyncGenerator<Session | null> {
          for(const session of this.sessions){
            if(session.getUserID() === userID && session.getCourseID() === courseID){
              yield session;
            }
          }
          yield null;
        }
    }
    const mockSessionRepository = new MockSessionRepositoryForLifetimeCourseStats();
    const sessionPersistService = new PersistSessionService(mockSessionRepository);
    const sessionOneToSave = Session.create({
        sessionID: "session-456",
        totalModulesStudied: 1,
        averageScore: 90,
        timeStudied: 120,
        courseID: "course-123",
        userID: "user-123"
    });
    const sessionTwoToSave = Session.create({
        sessionID: "session-457",
        totalModulesStudied: 8,
        averageScore: 89,
        timeStudied: 110,
        courseID: "course-123",
        userID: "user-123"
    });
    const sessionThreeToSave = Session.create({
        sessionID: "session-458",
        totalModulesStudied: 5,
        averageScore: 45,
        timeStudied: 200,
        courseID: "course-123",
        userID: "user-123"
    });
    const sessionFourToSave = Session.create({
        sessionID: "session-999",
        totalModulesStudied: 8,
        averageScore: 30,
        timeStudied: 180,
        courseID: "course-124",
        userID: "user-124"
    });
    const sessionFiveToSave = Session.create({
        sessionID: "session-899",
        totalModulesStudied: 8,
        averageScore: 30,
        timeStudied: 180,
        courseID: "course-124",
        userID: "user-123"
    });

    await sessionPersistService.saveSession(sessionOneToSave)
    await sessionPersistService.saveSession(sessionTwoToSave)
    await sessionPersistService.saveSession(sessionThreeToSave)
    await sessionPersistService.saveSession(sessionFourToSave)
    await sessionPersistService.saveSession(sessionFiveToSave)


  const foundSessions: Session[] = [];
      for await (const session of sessionPersistService.findCourseLifetimeStats("user-123", "course-123")) {
        if(session){
          foundSessions.push(session);
        }
    }

    expect(foundSessions).toHaveLength(3);
    expect(foundSessions).toContainEqual(sessionOneToSave);
    expect(foundSessions).toContainEqual(sessionTwoToSave);
    expect(foundSessions).toContainEqual(sessionThreeToSave);
  });

});
