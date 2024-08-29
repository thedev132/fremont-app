import AsyncStorage from "@react-native-async-storage/async-storage";
import User from "./UserModal";
import NestedOrganization from "../Posts/NestedOrganization";

export default async function getUserMe() {
    let accessToken = await AsyncStorage.getItem('accessToken');
    const response = await fetch('https://fremont-app.vercel.app/api/users/me/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${accessToken}`, // Add this line for authorization
        }
    });
    let data = await response.json();
    console.log(data)
    let orgs: NestedOrganization[] = [];
    for (let org of data["memberships"]) {
        let organization = org["organization"];
        orgs.push(new NestedOrganization(organization["id"], organization["name"], organization["type"]));
    }
    let user = new User(data["first_name"], data["last_name"],  data["picture_url"], data["email"], data["grad_year"], orgs);
    return user;
}