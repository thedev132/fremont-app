import AsyncStorage from "@react-native-async-storage/async-storage";
import EncryptedStorage from "react-native-encrypted-storage";
import { stripAfterAtSymbol } from "@/constants/utils";

export default async function makeUser() {
  let email = await AsyncStorage.getItem("IFEmail");
  let password = await EncryptedStorage.getItem("IFPassword");
  return { email: stripAfterAtSymbol(email), password };
}
