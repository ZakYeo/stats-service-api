import { Session } from "../Session";

export type SessionResponseObject = {
  courseID: string;
  userID: string;
  sessionID: string;
  totalModulesStudied: number;
  averageScore: number;
  timeStudied: number;
};

export type Result<T> = { ok: true; value: T } | { ok: false; error: Error };
export interface SessionRepository {
  saveSession(session: Session): Promise<Result<void>>;
  findSessionByID(sessionID: string, courseID: string, userID: string): Promise<Result<SessionResponseObject | null>>;
  findCourseLifetimeStats(userID: string, courseID: string): AsyncGenerator<Result<SessionResponseObject | null>>;
}