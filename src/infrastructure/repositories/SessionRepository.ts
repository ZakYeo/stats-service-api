import { Session } from "../../core/Session";

export type SessionResponseObject = {
  courseID: string;
  userID: string;
  sessionID: string;
  totalModulesStudied: number;
  averageScore: number;
  timeStudied: number;
}
export interface SessionRepository {
    saveSession(session: Session): Promise<void>;
    findSessionByID(sessionID: string, courseID: string, userID: string): Promise<SessionResponseObject | null>
    findCourseLifetimeStats(userID: string, courseID: string): AsyncGenerator<SessionResponseObject | null>;
}