import { Session } from "../../core/Session";

export interface SessionRepository {
    saveSession(session: Session): Promise<void>;
    findSessionByID(sessionID: string): Promise<Session | null>
}