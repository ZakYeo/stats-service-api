import { Session } from '../../../src/core/Session';

const validUUID = "934c5159-83ef-4c0e-8198-d5a5a62a34b1";

describe('Session Class', () => {

  it('should throw an error for invalid UUID sessionID', () => {
    expect(() => {
      new Session('invalid-session-id', 5, 80, 10, validUUID, validUUID);
    }).toThrow('Invalid SessionID received: invalid-session-id');

    expect(() => {
      Session.create({
        sessionID: 'invalid-session-id',
        totalModulesStudied: 5,
        averageScore: 80,
        timeStudied: 10,
        courseID: validUUID,
        userID:validUUID 
      });
    }).toThrow('Invalid SessionID received: invalid-session-id');
  });

  it('should throw an error for invalid UUID courseID', () => {
    expect(() => {
      new Session(validUUID, 5, 80, 10, "invalid-course-id", validUUID);
    }).toThrow('Invalid courseID received: invalid-course-id');

    expect(() => {
      Session.create({
        sessionID: validUUID,
        totalModulesStudied: 5,
        averageScore: 80,
        timeStudied: 10,
        courseID: "invalid-course-id",
        userID: validUUID 
      });
    }).toThrow('Invalid courseID received: invalid-course-id');
  });

  it('should throw an error for invalid UUID userID', () => {
    expect(() => {
      new Session(validUUID, 5, 80, 10, validUUID, "invalid-user-id");
    }).toThrow('Invalid userID received: invalid-user-id');

    expect(() => {
      Session.create({
        sessionID: validUUID,
        totalModulesStudied: 5,
        averageScore: 80,
        timeStudied: 10,
        courseID: validUUID,
        userID: "invalid-user-id"
      });
    }).toThrow('Invalid userID received: invalid-user-id');
  });

  it('should throw an error for negative timeStudied', () => {
    expect(() => {
      new Session(validUUID, 5, 80, -10, validUUID, validUUID);
    }).toThrow('Invalid timeStudied received: -10');

    expect(() => {
      Session.create({
        sessionID: validUUID,
        totalModulesStudied: 5,
        averageScore: 80,
        timeStudied: -10,
        courseID: validUUID,
        userID: validUUID
      });
    }).toThrow('Invalid timeStudied received: -10');
  });

  it('should throw an error for negative totalModulesStudied', () => {
    expect(() => {
      new Session(validUUID, -1, 80, 10, validUUID, validUUID);
    }).toThrow('Invalid totalModulesStudied received: -1');

    expect(() => {
      Session.create({
        sessionID: validUUID,
        totalModulesStudied: -1,
        averageScore: 80,
        timeStudied: 10,
        courseID: validUUID,
        userID: validUUID 
      });
    }).toThrow('Invalid totalModulesStudied received: -1');
  });

  it('should throw an error for negative averageScore', () => {
    expect(() => {
      new Session(validUUID, 1, -80, 10, validUUID, validUUID);
    }).toThrow('Invalid averageScore received: -80');

    expect(() => {
      Session.create({
        sessionID: validUUID,
        totalModulesStudied: 1,
        averageScore: -80,
        timeStudied: 10,
        courseID: validUUID,
        userID: validUUID
      });
    }).toThrow('Invalid averageScore received: -80');
  });

  it('should throw an error if sessionID is not a string', () => {
    expect(() => {
      new Session(123 as any, 5, 80, 10, "course-123", "user-123");
    }).toThrow();
  });

  it('should throw an error if totalModulesStudied is not a number', () => {
    expect(() => {
      new Session('session-123', 'five' as any, 80, 10, "course-123", "user-123");
    }).toThrow();
  });

  it('should throw an error if averageScore is not a number', () => {
    expect(() => {
      new Session('session-123', 5, 'eighty' as any, 10, "course-123", "user-123");
    }).toThrow();
  });

  it('should throw an error if timeStudied is not a number', () => {
    expect(() => {
      new Session('session-123', 5, 80, "ten" as any, "course-123", "user-123");
    }).toThrow();
  });

  it('should create a valid Session object with correct data', () => {
    const session = new Session(validUUID, 5, 80, 10, validUUID, validUUID);
    expect(session.getSessionID()).toBe(validUUID);
    expect(session.getTotalModulesStudied()).toBe(5);
    expect(session.getAverageScore()).toBe(80);
    expect(session.getTimeStudied()).toBe(10);
    expect(session.getCourseID()).toBe(validUUID);
    expect(session.getUserID()).toBe(validUUID);
  });

  it('should return session JSON data correctly', () => {
    const session = new Session(validUUID, 5, 80, 10, validUUID, validUUID);
    expect(session.getSessionJSONData()).toEqual({
      sessionID: validUUID,
      totalModulesStudied: 5,
      averageScore: 80,
      timeStudied: 10,
      courseID: validUUID,
      userID: validUUID
    });
  });
});
