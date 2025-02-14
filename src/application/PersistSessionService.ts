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
        return await this.sessionRepository.findSessionByID(sessionID, courseID, userID);
    }

    public findCourseLifetimeStats(userID: string, courseID: string): AsyncGenerator<Session | null>{
        return this.sessionRepository.findCourseLifetimeStats(userID, courseID);
    }
}