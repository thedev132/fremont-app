export default class Course {
    private name: string | undefined;
    private teacherName: string | undefined;
    private room: string | undefined;
    private period: string | undefined;
    private startTime: string | undefined;
    private endTime: string | undefined;
    private periodScheduleName: string | undefined;

    constructor(name: string, teacherName: string, room: string, period: string, startTime: string, endTime: string, periodScheduleName: string) {

        this.name = name;
        this.teacherName = teacherName;
        this.room = room;
        this.period = period;
        this.startTime = startTime;
        this.endTime = endTime;
        this.periodScheduleName = periodScheduleName;
    }

    public getName() {
        return this.name;
    }

    public getTeacherName() {
        return this.teacherName;
    }

    public getRoom() {
        return this.room;
    }

    public getPeriod() {
        return this.period;
    }

    public getStartTime() {
        return this.startTime;
    }

    public getEndTime() {
        return this.endTime;
    }

    public getPeriodScheduleName() {
        return this.periodScheduleName;
    }

}