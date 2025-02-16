import { Pool } from "pg"; 
import { SessionRepository } from "./SessionRepository";
import { Session } from "../../core/Session";

export class PostgresSessionRepository implements SessionRepository {
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT || "5432"),
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
    });
  }

  async saveSession(session: Session): Promise<void> {
    const query = `
      INSERT INTO sessions (session_id, course_id, user_id, total_modules, average_score, time_studied, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `;
    const values = [
      session.getSessionID(),
      session.getCourseID(),
      session.getUserID(),
      session.getTotalModulesStudied(),
      session.getAverageScore(),
      session.getTimeStudied(),
    ];

    const client = await this.pool.connect();
    try {
      await client.query(query, values);
      console.log(`Session ${session.getSessionID()} saved successfully.`);
    } catch (error) {
      console.error("Error saving session:", error);
      throw new Error("Failed to save session");
    } finally {
      client.release(); // Always release the client back to the pool
    }
  }

  async findSessionByID(sessionID: string, courseID: string, userID: string): Promise<Session | null> {
    const query = `
      SELECT session_id, course_id, user_id, total_modules, average_score, time_studied, created_at
      FROM sessions
      WHERE session_id = $1 AND course_id = $2 AND user_id = $3;
    `;
    const values = [sessionID, courseID, userID];

    const client = await this.pool.connect();
    try {
      const result = await client.query(query, values);
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return Session.create({
          sessionID: row.session_id,
          courseID: row.course_id,
          userID: row.user_id,
          totalModulesStudied: row.total_modules,
          averageScore: row.average_score,
          timeStudied: row.time_studied,
        });
      }
      return null;
    } catch (error) {
      console.error("Error finding session:", error);
      throw new Error("Failed to find session");
    } finally {
      client.release();
    }
  }

  async *findCourseLifetimeStats(userID: string, courseID: string): AsyncGenerator<Session | null> {
    const query = `
      SELECT session_id, course_id, user_id, total_modules, average_score, time_studied, created_at
      FROM sessions
      WHERE course_id = $1 AND user_id = $2
      ORDER BY created_at;
    `;
    const values = [courseID, userID];

    const client = await this.pool.connect();
    try {
      const result = await client.query(query, values);
      for (const row of result.rows) {
        yield Session.create({
          sessionID: row.session_id,
          courseID: row.course_id,
          userID: row.user_id,
          totalModulesStudied: row.total_modules,
          averageScore: row.average_score,
          timeStudied: row.time_studied,
        });
      }
    } catch (error) {
      console.error("Error fetching course lifetime stats:", error);
      throw new Error("Failed to fetch course lifetime stats");
    } finally {
      client.release();
    }
  }
}
