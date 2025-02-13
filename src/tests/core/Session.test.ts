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

  it('should throw an error for negative totalModulesStudied', () => {
    expect(() => {
      new Session('session-123', -1, 80, 10);
    }).toThrow('totalModulesStudied must be non-negative');

    expect(() => {
      new Session.create({
        sessionID: 'session-123', 
        totalModulesStudied: -1, 
        averageScore: 80,
        timeStudied: 10
      });
    }).toThrow('totalModulesStudied must be non-negative');
  });

  it('should throw an error for negative averageScore', () => {
    expect(() => {
      new Session('session-123', 1, -80, 10);
    }).toThrow('averageScore must be non-negative');

    expect(() => {
      new Session.create({
        sessionID: 'session-123', 
        totalModulesStudied: 1, 
        averageScore: -80,
        timeStudied: 10
      });
    }).toThrow('totalModulesStudied must be non-negative');
  });
});
