import { SessionRepository } from "../infrastructure/repositories/SessionRepository";
import { Session } from "../core/Session";

export class PersistSessionService{
    private sessionRepository: SessionRepository;

    constructor(sessionRepository: SessionRepository){
        this.sessionRepository = sessionRepository;
    }

    public async saveSession(session: Session): Promise<void>{
        if(await this.findSessionByID(
            session.getSessionID(), 
            session.getCourseID(),
            session.getUserID()
        ) != null){
            throw new Error("Cannot save: SessionID already exists.")
        }
        return this.sessionRepository.saveSession(session);

    }
    public async findSessionByID(sessionID: string, courseID: string, userID: string): Promise<Session | null>{
        const sessionResponse = await this.sessionRepository.findSessionByID(sessionID, courseID, userID);
        if(sessionResponse){
            return Session.create({
                sessionID: sessionResponse.sessionID,
                courseID: sessionResponse.courseID,
                userID: sessionResponse.userID,
                totalModulesStudied: sessionResponse.totalModulesStudied,
                averageScore: sessionResponse.averageScore,
                timeStudied: sessionResponse.timeStudied 
            })
        }else{
            return null;
        }
    }

    public async findCourseLifetimeStats(userID: string, courseID: string): Promise<Session[]> {
        const sessions: Session[] = [];
        const resultGenerator = this.sessionRepository.findCourseLifetimeStats(userID, courseID);

        for await (const rawData of resultGenerator) {
            if (rawData) {
            const session = Session.create({
                sessionID: rawData.sessionID,
                courseID: rawData.courseID,
                userID: rawData.userID,
                totalModulesStudied: rawData.totalModulesStudied,
                averageScore: rawData.averageScore,
                timeStudied: rawData.timeStudied,
            });
            sessions.push(session);
            } else {
            console.warn("Received null session data.");
            }
        }

        return sessions;
    }

 
}