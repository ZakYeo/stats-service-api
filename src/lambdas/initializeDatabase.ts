import { APIGatewayEvent, Context, APIGatewayProxyResult } from "aws-lambda";
import { LambdaHandlerFactory } from "../infrastructure/factories/LambdaHandlerFactory";
import { Tracer } from '@aws-lambda-powertools/tracer';
import type { LambdaInterface } from '@aws-lambda-powertools/commons/types';
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT || "5432"),
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  ssl: { rejectUnauthorized: false }
});
const tracer = new Tracer({ serviceName: 'InitializeDatabaseService' });

class Lambda implements LambdaInterface {
  @tracer.captureLambdaHandler()
  public async handler(_event: APIGatewayEvent, _context: Context): Promise<APIGatewayProxyResult> {
    const client = await pool.connect();
    try {
        console.log("Initializing database...");
        await client.query(INIT_DB_SQL);
        console.log("Database initialized successfully.");
        return { statusCode: 200, body: "Database initialized successfully" };
    } catch (error) {
        console.error("Error initializing database:", error);
        return { statusCode: 500, body: "Failed to initialize database" };
    } finally {
        client.release();
    }
  }
}

const handlerClass = new Lambda();
export const handler = handlerClass.handler.bind(handlerClass);

const INIT_DB_SQL = `
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE IF NOT EXISTS users (
  user_id UUID PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS courses (
  course_id UUID PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id UUID PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES courses(course_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(user_id),
  total_modules INTEGER NOT NULL,
  average_score FLOAT NOT NULL,
  time_studied INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (user_id) VALUES 
('e8df5aae-870e-46d7-a62b-57b8c6a129a2'),
('d3b07384-d9a1-4e21-bd7f-662b933ad1af'),
('123e4567-e89b-12d3-a456-426614174000');

INSERT INTO courses (course_id) VALUES 
('c0a80102-0000-0000-0000-000000000001'),
('c0a80102-0000-0000-0000-000000000002'),
('7baaeaa2-07c3-49b6-a57e-59b07d86e137');
`;