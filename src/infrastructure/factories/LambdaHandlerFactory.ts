import { PersistSessionService } from "../../application/PersistSessionService";
import { LambdaHandler } from "../adapters/LambdaHandler";
import { PostgresSessionRepository } from "../repositories/PostgresSessionRepository";

export class LambdaHandlerFactory {
  static create(): LambdaHandler {
    const sessionRepository = new PostgresSessionRepository();
    const persistSessionService = new PersistSessionService(sessionRepository);
    return new LambdaHandler(persistSessionService);
  }
}
