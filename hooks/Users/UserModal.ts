export default class User {
    private firstName: string;
    private lastName: string;
    private pictureUrl: string;
    private email: string;
    private gradYear: number;

    constructor(firstName: string, lastName: string, pictureUrl: string, email: string, gradYear: number) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.pictureUrl = pictureUrl;
        this.email = email;
        this.gradYear = gradYear;
    }

    public getFirstName() {
        return this.firstName;
    }

    public getLastName() {
        return this.lastName;
    }

    public getFullName() {
        return this.firstName + " " + this.lastName;
    }

    public getPictureUrl() {
        return this.pictureUrl;
    }

    public getEmail() {
        return this.email;
    }

    public getGradYear() {
        return this.gradYear;
    }

}