export default class NestedOrganization {
  private id: string | undefined;
  private name: string | undefined;
  private type: string | undefined;

  constructor(id: string, name: string, type: string) {
    this.id = id;
    this.name = name;
    this.type = type;
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
}
