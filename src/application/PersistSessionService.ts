import { SessionRepository, Result } from "../infrastructure/repositories/SessionRepository";
import { Session } from "../core/Session";

export class PersistSessionService{
    private sessionRepository: SessionRepository;

    constructor(sessionRepository: SessionRepository){
        this.sessionRepository = sessionRepository;
    }

    public async saveSession(session: Session): Promise<Result<void>>{
        const existingSessionResult = await this.sessionRepository.findSessionByID(
            session.getSessionID(),
            session.getCourseID(),
            session.getUserID()
        );

        if (!existingSessionResult.ok) {
        return { ok: false, error: existingSessionResult.error };
        }

        if (existingSessionResult.value) {
        return { ok: false, error: new Error("Cannot save: SessionID already exists.") };
        }

        return await this.sessionRepository.saveSession(session);
    }

    public async findSessionByID(sessionID: string, courseID: string, userID: string): Promise<Result<Session | null>>{
        const sessionResponse = await this.sessionRepository.findSessionByID(sessionID, courseID, userID);
        if (!sessionResponse.ok) {
            return { ok: false, error: sessionResponse.error };
        }
        if (!sessionResponse.value) {
            return { ok: true, value: null };
        }
        return {
            ok: true,
            value: Session.create({
                sessionID: sessionResponse.value.sessionID,
                courseID: sessionResponse.value.courseID,
                userID: sessionResponse.value.userID,
                totalModulesStudied: sessionResponse.value.totalModulesStudied,
                averageScore: sessionResponse.value.averageScore,
                timeStudied: sessionResponse.value.timeStudied,
            }),
        };
    }

    public async findCourseLifetimeStats(userID: string, courseID: string): Promise<Result<Session[]>> {
        const sessions: Session[] = [];
        const resultGenerator = this.sessionRepository.findCourseLifetimeStats(userID, courseID);

        try {
            for await (const rawDataResult of resultGenerator) {
                if (!rawDataResult.ok) {
                return { ok: false, error: rawDataResult.error };
                }

                if (rawDataResult.value) {
                const session = Session.create({
                    sessionID: rawDataResult.value.sessionID,
                    courseID: rawDataResult.value.courseID,
                    userID: rawDataResult.value.userID,
                    totalModulesStudied: rawDataResult.value.totalModulesStudied,
                    averageScore: rawDataResult.value.averageScore,
                    timeStudied: rawDataResult.value.timeStudied,
                });

                sessions.push(session);
                } else {
                console.warn("Received null session data.");
                }
            }

            return { ok: true, value: sessions };
        } catch (error) {
            return { ok: false, error: error instanceof Error ? error : new Error("Unknown error occurred") };
        }
  }
 
}