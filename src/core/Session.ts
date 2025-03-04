import validator from "validator"

export interface SessionDataObject {
    userID: string;
    sessionID: string;
    courseID: string;
    totalModulesStudied: number;
    averageScore: number;
    timeStudied: number;
}
export class Session{
    private sessionID!: string;
    private totalModulesStudied!: number;
    private averageScore!: number;
    private timeStudied!: number;
    private courseID!: string;
    private userID!: string;

    constructor(sessionID: string, totalModulesStudied: number, averageScore: number, timeStudied: number, courseID: string, userID: string){
        this.setSessionID(sessionID);
        this.setTotalModulesStudied(totalModulesStudied);
        this.setAverageScore(averageScore);
        this.setTimeStudied(timeStudied);
        this.setCourseID(courseID);
        this.setUserID(userID);
    }

    static create({
        sessionID,
        totalModulesStudied,
        averageScore,
        timeStudied,
        courseID,
        userID
    }: {
        sessionID: string;
        totalModulesStudied: number;
        averageScore: number;
        timeStudied: number;
        courseID: string;
        userID: string
    }): Session {
        return new Session(sessionID, totalModulesStudied, averageScore, timeStudied, courseID, userID);
    }

    public setSessionID(sessionID: string){
        if(!this.isValidUUID(sessionID)){
            throw new Error(`Invalid SessionID received: ${sessionID}`)
        }
        this.sessionID = sessionID;
    }
    public getSessionID(): string{
        return this.sessionID;
    }

    public setTotalModulesStudied(totalModulesStudied: number){
        if(!this.isValidPositiveNumber(totalModulesStudied)){
            throw new Error(`Invalid totalModulesStudied received: ${totalModulesStudied}`)
        }
        this.totalModulesStudied = totalModulesStudied;
    }

    public getTotalModulesStudied(): number{
        return this.totalModulesStudied;
    }

    public setAverageScore(averageScore: number){
        if(!this.isValidPositiveNumber(averageScore)){
            throw new Error(`Invalid averageScore received: ${averageScore}`)
        }
        this.averageScore = averageScore;
    }

    public getAverageScore(): number{
        return this.averageScore;
    }

    public setTimeStudied(timeStudied: number){
        if(!this.isValidPositiveNumber(timeStudied)){
            throw new Error(`Invalid timeStudied received: ${timeStudied}`)
        }
        this.timeStudied = timeStudied;
    }
    public getTimeStudied(): number{
        return this.timeStudied;
    }

    public setCourseID(courseID: string){
        if(!this.isValidUUID(courseID)){
            throw new Error(`Invalid courseID received: ${courseID}`)
        }
        this.courseID = courseID;
    }

    public getCourseID(): string{
        return this.courseID;
    }


    public setUserID(userID: string){
        if(!this.isValidUUID(userID)){
            throw new Error(`Invalid userID received: ${userID}`)
        }
        this.userID = userID;
    }

    public getUserID(): string{
        return this.userID;
    }

    public getSessionJSONData(): SessionDataObject{
        return {
            userID: this.userID,
            courseID: this.courseID,
            sessionID: this.sessionID,
            totalModulesStudied: this.totalModulesStudied,
            averageScore: this.averageScore,
            timeStudied: this.timeStudied
        }
    }

    private isValidUUID(value: string): Boolean {
        if (typeof value !== 'string' || !validator.isUUID(value)) {
            return false;
        }
        return true;
    }

    private isValidPositiveNumber(value: number): Boolean {
        if (typeof value !== 'number' || isNaN(value) || value < 0) {
            return false;
        }
        return true;
    }
}