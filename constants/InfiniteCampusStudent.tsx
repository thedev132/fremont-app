export default class Student {
    private firstName: string | undefined;
    private lastName: string | undefined;
    private grade: string | undefined;
    private studentID: string | undefined;
    private profilePicture: string | undefined;

    constructor(firstName: string, lastName: string, grade: string, studentID: string, profilePicture: string) {      
        this.firstName = firstName;
        this.lastName = lastName;
        this.grade = grade;
        this.studentID = studentID;
        this.profilePicture = profilePicture;
    }

    public getFirstName() {
        return this.firstName;
    }

    public getLastName() {
        return this.lastName;
    }

    public getGrade() {
        return this.grade;
    }

    public getStudentID() {
        return this.studentID;
    }

    public getProfilePicture() {
        return this.profilePicture;
    }

    public getFullName() {
        return this.firstName + ' ' + this.lastName;
    }
    
}