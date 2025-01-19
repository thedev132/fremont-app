import AsyncStorage from "@react-native-async-storage/async-storage";

export const register = async (email: string, password: string) => {
  try {
    let response = await fetch(
      "https://fremont-app.vercel.app/api/auth/users/",
      {
        headers: {
          "content-type": "application/json",
        },

        body: `{\n    \"type\": 3,\n    \"email\": \"${email}\",\n    \"password\": \"${password}\",\n    \"re_password\": \"${password}\"\n}`,
        method: "POST",
      },
    );

    if (response.ok) {
      return true;
    }
    let data = await response.json();
    if (data["email"]) {
      return data["email"][0];
    } else if (data["password"]) {
      return data["password"][0];
    }
  } catch (err) {
    return Promise.reject(err);
  }
};

export const login = async (email: string, password: string) => {
  try {
    let response = await fetch(
      "https://fremont-app.vercel.app/api/auth/jwt/create",
      {
        headers: {
          "content-type": "application/json",
        },

        body: `{\n    \"email\": \"${email}\",\n    \"password\": \"${password}\"\n}`,
        method: "POST",
      },
    );
    let data = await response.json();
    if (!response.ok) {
      return false;
    }
    await AsyncStorage.setItem("accessToken", data["access"]);
    await AsyncStorage.setItem("refreshToken", data["refresh"]);
    return true;
  } catch (err) {
    return Promise.reject(err);
  }
};
