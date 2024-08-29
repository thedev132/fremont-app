import AsyncStorage from "@react-native-async-storage/async-storage";


export const getToken = async (state, code) => {
    const body = new URLSearchParams();
    body.append('code', code);
    body.append('state', state);
    console.log(body.toString());
    let response = await fetch("https://fremont-app.vercel.app/api/auth/o/google/", {
      "headers": {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      "method": "POST",
    }).then((response) => response.json());
    const accessToken = response["access"];
    const refreshToken = response["refresh"];
    console.log(accessToken)
    console.log(refreshToken)
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);    
  }