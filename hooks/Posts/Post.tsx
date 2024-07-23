import NestedOrganization from "./NestedOrganization";

export default class Post {
    private id: string | undefined;
    private title: string | undefined;
    private content: string | undefined;
    private url : string | undefined;
    private date: string | undefined;
    private organization: NestedOrganization | undefined;

    constructor(id: string, title: string, content: string, url: string, date: string, organization: NestedOrganization) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.url = url;
        this.date = date;
        this.organization = organization
    }

    public getId() {
        return this.id;
    }

    public getTitle() {
        return this.title;
    }

    public getContent() {
        return this.content;
    }

    public getUrl() {
        return this.url;
    }

    public getDate() {
        return this.date;
    }

    public getOrganization() {
        return this.organization;
    }

}