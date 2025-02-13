import { SessionRepository } from "../infrastructure/repositories/SessionRepository";
import { Session } from "../core/Session";

export class PersistSessionService{
    private sessionRepository: SessionRepository;

    constructor(sessionRepository: SessionRepository){
        this.sessionRepository = sessionRepository;
    }

    public async saveSession(session: Session): Promise<void>{
        if(await this.findSessionByID(session.getSessionID()) != null){
            throw new Error("Cannot save: SessionID already exists.")
        }
        return this.sessionRepository.saveSession(session);

    }
    public async findSessionByID(sessionID: string): Promise<Session | null>{
        return await this.sessionRepository.findSessionByID(sessionID);
    }
}