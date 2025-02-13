
export class Session{
    private sessionID!: string;
    private totalModulesStudied!: number;
    private averageScore!: number;
    private timeStudied!: number;
    private courseID!: string;

    constructor(sessionID: string, totalModulesStudied: number, averageScore: number, timeStudied: number, courseID: string){
        this.setSessionID(sessionID);
        this.setTotalModulesStudied(totalModulesStudied);
        this.setAverageScore(averageScore);
        this.setTimeStudied(timeStudied);
        this.setCourseID(courseID);
    }

    static create({
        sessionID,
        totalModulesStudied,
        averageScore,
        timeStudied,
        courseID
    }: {
        sessionID: string;
        totalModulesStudied: number;
        averageScore: number;
        timeStudied: number;
        courseID: string;
    }): Session {
        return new Session(sessionID, totalModulesStudied, averageScore, timeStudied, courseID);
    }

    public setSessionID(sessionID: string){
        this.sessionID = sessionID;
    }

    public setTotalModulesStudied(totalModulesStudied: number){
        this.nonNegativeCheck(totalModulesStudied, "Total Modules Studied")
        this.totalModulesStudied = totalModulesStudied;
    }

    public setAverageScore(averageScore: number){
        this.nonNegativeCheck(averageScore, "Average Score")
        this.averageScore = averageScore;
    }

    public setTimeStudied(timeStudied: number){
        this.nonNegativeCheck(timeStudied, "Time Studied")
        this.timeStudied = timeStudied;
    }
    private nonNegativeCheck(value: number, variableName: string) {
        if (value < 0) {
            throw new Error(`${variableName} must be non-negative`);
        }
    }

    public setCourseID(courseID: string){
        this.courseID = courseID;
    }

}