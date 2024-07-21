import AsyncStorage from "@react-native-async-storage/async-storage";
import User from "./UserModal";

export default async function getUserMe() {
    let accessToken = await AsyncStorage.getItem('accessToken');
    const response = await fetch('https://fremont-app-backend.vercel.app/api/users/me', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${accessToken}`, // Add this line for authorization
        }
    });
    let data = await response.json();
    let user = new User(data["first_name"], data["last_name"],  data["picture_url"], data["email"], data["grad_year"]);
    return user;
}