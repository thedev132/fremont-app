export default class Organization {
    private id: string | undefined;
    private name: string | undefined;
    private type: string | undefined;
    private day: string | undefined;
    private location: string | undefined;
    private time: string | undefined;
    private description: string | undefined;


    constructor(id: string, name: string, type:string, day: string, location: string, time: string, description: string) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.day = day;
        this.location = location;
        this.time = time;
        this.description = description
    }

    public getId() {
        return this.id;
    }

    public getName() {
        return this.name;
    }

    public getType() {
        return this.type;
    }

    public getDay() {
        return this.day;
    }

    public getLocation() {
        return this.location;
    }

    public getTime() {
        return this.time;
    }

    public getDescription() {
        return this.description;
    }
}