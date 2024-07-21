import React = require("react");
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import getUserMe from "@/hooks/Users/Users";
import User from "@/hooks/Users/UserModal";
import AutoHeightImage from "react-native-auto-height-image";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen({navigation}) {

    const [me, setMe] = React.useState<User | null>();

    React.useEffect(() => {
        const fetchData = async () => {
            let me = await getUserMe();
            setMe(me);
        }
        fetchData();
    }, [])

    return (
        <SafeAreaView style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <View style={{flex:1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                {
                    me?.getPictureUrl() == null || me?.getPictureUrl() == '' ? <Ionicons name="person-circle-outline" size={50} /> : null
                }
                <AutoHeightImage source={{uri: me?.getPictureUrl() ?? ''}} width={50} style={{borderRadius: 50}}/>
                <View>
                    <Text>{me?.getFullName()}</Text>
                    <Text>{me?.getEmail()}</Text>
                </View>
            </View>
        </SafeAreaView>
    )
}