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


});
