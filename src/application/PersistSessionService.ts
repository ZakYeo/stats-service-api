import { SessionRepository, Result } from "../core/ports/SessionRepository";
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

    public async findCourseLifetimeStats(userID: string, courseID: string): Promise<Result<{
        totalModulesStudied: number;
        averageScore: number;
        timeStudied: number;
    }>> {
        let totalModulesStudied = 0;
        let totalScore = 0;
        let timeStudied = 0;
        let sessionCount = 0;

        const resultGenerator = this.sessionRepository.findCourseLifetimeStats(userID, courseID);

        try {
            for await (const rawDataResult of resultGenerator) {
                if (!rawDataResult.ok) {
                    return { ok: false, error: rawDataResult.error };
                }

                if (rawDataResult.value) {
                    totalModulesStudied += rawDataResult.value.totalModulesStudied;
                    totalScore += rawDataResult.value.averageScore;
                    timeStudied += rawDataResult.value.timeStudied;
                    sessionCount++;
                } else {
                    console.warn("Received null session data.");
                }
            }

            if (sessionCount === 0) {
                return { ok: true, value: { totalModulesStudied: 0, averageScore: 0, timeStudied: 0 } };
            }

            return {
                ok: true,
                value: {
                    totalModulesStudied,
                    averageScore: totalScore / sessionCount,
                    timeStudied
                }
            };
        } catch (error) {
            return { ok: false, error: error instanceof Error ? error : new Error("Unknown error occurred") };
        }
    }
  
}