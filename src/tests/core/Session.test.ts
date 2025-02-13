// tests/core/domain/Session.test.ts
import { Session } from '../../../src/core/Session';

describe('Session Class', () => {
  it('should throw an error for negative timeStudied', () => {
    expect(() => {
      new Session('session-123', 5, 80, -10);
    }).toThrow('timeStudied must be non-negative');

    expect(() => {
      new Session.create({
        sessionID: 'session-123', 
        totalModulesStudied: 5, 
        averageScore: 80,
        timeStudied: -10
      });
    }).toThrow('timeStudied must be non-negative');
  });
});
