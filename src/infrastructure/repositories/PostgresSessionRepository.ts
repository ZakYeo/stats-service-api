import { Pool } from "pg"; 
import { SessionRepository, Result, SessionResponseObject } from "../../core/ports/SessionRepository";
import { Session } from "../../core/Session";
import prisma from "../../core/persistence/prisma";


export class PostgresSessionRepository implements SessionRepository {

  async saveSession(session: Session): Promise<Result<void>> {
    try {
      await prisma.sessions.create({
        data: {
          session_id: session.getSessionID(),
          course_id: session.getCourseID(),
          user_id: session.getUserID(),
          total_modules: session.getTotalModulesStudied(),
          average_score: session.getAverageScore(),
          time_studied: session.getTimeStudied(),
          created_at: new Date(),
        },
      });

      console.log(`Session ${session.getSessionID()} saved successfully.`);
      return { ok: true, value: undefined };
    } catch (error) {
      console.error("Error saving session:", error);
      return { ok: false, error: new Error(`Failed to save session: ${error}`) };
    }
  } 

  async findSessionByID(sessionID: string, courseID: string, userID: string): Promise<Result<SessionResponseObject | null>> {
    try {
      const session = await prisma.sessions.findUnique({
        where: {
          session_id_course_id_user_id: { session_id: sessionID, course_id: courseID, user_id: userID },
        },
      });

      if (!session) {
        return { ok: true, value: null };
      }

      return {
        ok: true,
        value: {
          sessionID: session.session_id,
          courseID: session.course_id,
          userID: session.user_id,
          totalModulesStudied: session.total_modules,
          averageScore: session.average_score,
          timeStudied: session.time_studied,
        },
      };
    } catch (error) {
      console.error("Error finding session:", error);
      return { ok: false, error: new Error(`Failed to find session: ${error}`) };
    }
  } 

 async *findCourseLifetimeStats(userID: string, courseID: string): AsyncGenerator<Result<SessionResponseObject | null>> {
    try {
      const sessions = await prisma.sessions.findMany({
        where: { course_id: courseID, user_id: userID },
        orderBy: { created_at: "asc" },
      });

      for (const session of sessions) {
        yield {
          ok: true,
          value: {
            sessionID: session.session_id,
            courseID: session.course_id,
            userID: session.user_id,
            totalModulesStudied: session.total_modules,
            averageScore: session.average_score,
            timeStudied: session.time_studied,
          },
        };
      }

      yield { ok: true, value: null }; // End of search
    } catch (error) {
      console.error("Error fetching course lifetime stats:", error);
      yield { ok: false, error: new Error(`Failed to fetch stats: ${error}`) };
    }
  }
} 