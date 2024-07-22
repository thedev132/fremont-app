import AsyncStorage from "@react-native-async-storage/async-storage";
import EncryptedStorage from "react-native-encrypted-storage/lib/typescript/EncryptedStorage";

export default async function SignOut() {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('loggedIn');
    await AsyncStorage.removeItem('me');
    await AsyncStorage.removeItem('IFEmail');
    await EncryptedStorage.removeItem('IFPassword');
}