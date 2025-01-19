import AsyncStorage from "@react-native-async-storage/async-storage";
import Organization from "./Organization";

export default async function getAllOrganizations(page: number) {
  let accessToken = await AsyncStorage.getItem("accessToken");
  const response = await fetch(
    `https://fremont-app.vercel.app/api/orgs/?page=${page}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // Add this line for authorization
      },
    },
  );
  const data = await response.json();
  let organizations: Organization[] = [];
  for (let org of data["results"]) {
    organizations.push(
      new Organization(
        org["id"],
        org["name"],
        org["type"],
        org["day"],
        org["time"],
        org["location"],
        org["description"],
      ),
    );
  }
  return organizations;
}
