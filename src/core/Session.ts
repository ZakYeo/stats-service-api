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
        this.sessionID = sessionID;
    }
    public getSessionID(): string{
        return this.sessionID;
    }

    public setTotalModulesStudied(totalModulesStudied: number){
        this.nonNegativeCheck(totalModulesStudied, "Total Modules Studied")
        this.totalModulesStudied = totalModulesStudied;
    }

    public getTotalModulesStudied(): number{
        return this.totalModulesStudied;
    }

    public setAverageScore(averageScore: number){
        this.nonNegativeCheck(averageScore, "Average Score")
        this.averageScore = averageScore;
    }

    public getAverageScore(): number{
        return this.averageScore;
    }

    public setTimeStudied(timeStudied: number){
        this.nonNegativeCheck(timeStudied, "Time Studied")
        this.timeStudied = timeStudied;
    }
    public getTimeStudied(): number{
        return this.timeStudied;
    }
    private nonNegativeCheck(value: number, variableName: string) {
        if (value < 0) {
            throw new Error(`${variableName} must be non-negative`);
        }
    }

    public setCourseID(courseID: string){
        this.courseID = courseID;
    }

    public getCourseID(): string{
        return this.courseID;
    }


    public setUserID(userID: string){
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

}