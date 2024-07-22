import React = require("react");
import { View, Text, TouchableOpacity, ActivityIndicator, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import getUserMe from "@/hooks/Users/Users";
import User from "@/hooks/Users/UserModal";
import AutoHeightImage from "react-native-auto-height-image";
import { Ionicons } from "@expo/vector-icons";
import { Feather } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import SignOut from "@/hooks/ServerAuth/SignOut";

export default function ProfileScreen({navigation}) {

    const [me, setMe] = React.useState<User | null>();
    const [loading, setLoading] = React.useState(false);

    React.useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            let storedMe = await AsyncStorage.getItem('me');
            console.log(storedMe);
            if (storedMe != null) {
                let json = JSON.parse(storedMe);
                let user = new User(json["firstName"], json["lastName"], json["pictureUrl"], json["email"], json["grad_year"]);
                setMe(user);
                setLoading(false);
            }
            else {
                let me = await getUserMe();
                await AsyncStorage.setItem('me', JSON.stringify(me));
                setLoading(false);
                setMe(me);
            }

        }
        fetchData();
    }, [])

    if (loading) {
        return (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size='large' color='#BF1B1B'/>
          </View>
        )
      }


    return (
        <SafeAreaView style={{flex: 1, alignItems: 'center'}}>
            <View>
                <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', marginTop: 70, padding:15 , borderRadius: 15,  shadowColor: '#000', elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3,shadowRadius: 2,}}>
                    {
                        me?.getPictureUrl() == null || me?.getPictureUrl() == '' ? <View style={{marginRight: 10}}><Ionicons name="person-circle-outline" size={50} /></View> : <AutoHeightImage source={{uri: me?.getPictureUrl() ?? ''}} width={50} style={{borderRadius: 50, marginRight: 10}}/>

                    }
                    <View>
                        <Text>{me?.getFullName()}</Text>
                        <Text>{me?.getEmail()}</Text>
                    </View>
                </View>

                <TouchableOpacity onPress={() => Linking.openURL("https://fhs.fuhsd.org")}>
                    <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', marginTop: 30, padding:15 , borderRadius: 15,  shadowColor: '#000', elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3,shadowRadius: 2}}>
                        <Text style={{fontSize: 16}}>Fremont High School Website</Text>
                        <Feather name="external-link" size={18} color="black" style={{marginLeft: 'auto'}} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL("https://fremontasb.org")}>
                    <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', marginTop: 10, padding:15 , borderRadius: 15,  shadowColor: '#000', elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3,shadowRadius: 2}}>
                        <Text style={{fontSize: 16}}>Fremont ASB Website</Text>
                        <Feather name="external-link" size={18} color="black" style={{marginLeft: 'auto'}} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL("https://www.instagram.com/firebirdfelipe/")}>
                    <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', marginTop: 30, padding:15 , borderRadius: 15,  shadowColor: '#000', elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3,shadowRadius: 2}}>
                        <Text style={{fontSize: 16}}>Firebird Felipe Instagram</Text>
                        <Feather name="external-link" size={18} color="black" style={{marginLeft: 'auto'}} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL("https://fuhsd.schoology.com")}>
                    <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', marginTop: 30, padding:15 , borderRadius: 15,  shadowColor: '#000', elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3,shadowRadius: 2}}>
                        <Text style={{fontSize: 16}}>Schoology</Text>
                        <Feather name="external-link" size={18} color="black" style={{marginLeft: 'auto'}} />
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Linking.openURL("https://fuhsd.infinitecampus.org")}>
                    <View style={{flexDirection: 'row', alignItems: 'center', backgroundColor: '#eee', marginTop: 10, padding:15 , borderRadius: 15,  shadowColor: '#000', elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.3,shadowRadius: 2}}>
                        <Text style={{fontSize: 16}}>Infinite Campus</Text>
                        <Feather name="external-link" size={18} color="black" style={{marginLeft: 'auto'}} />
                    </View>
                </TouchableOpacity>


                <TouchableOpacity onPress={SignOut}>
                    <View style={{backgroundColor: '#BF1B1B', padding: 15, marginTop: 50, paddingHorizontal: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center'}}>
                        <Text className='text-white text-xl ml-3 font-bold'>Sign Out</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    )
}