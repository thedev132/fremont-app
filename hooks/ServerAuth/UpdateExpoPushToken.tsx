import AsyncStorage from "@react-native-async-storage/async-storage";

export default async function UpdateExpoPushToken(token) {
  let accessToken = await AsyncStorage.getItem('accessToken');
  const response = await fetch("https://fremont-app-backend.vercel.app/api/users/me/tokens/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`, // Add this line for authorization
    },
    body: JSON.stringify({ token }), // Simplified body formatting
  });
}