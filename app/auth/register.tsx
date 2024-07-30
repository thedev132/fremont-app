import React from "react"
import { TouchableOpacity, View, Text} from "react-native"
import { ActivityIndicator, PaperProvider, TextInput } from "react-native-paper"
import { login, register } from "@/hooks/ServerAuth/ManuelLoginHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Register({navigation}) {

    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [repassword, setRePassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    async function handleLoginPress(): Promise<void> {
        if (password !== repassword) {
            // Show error message
            return;
        }
        // Register the user
        try {
            let registerResponse = register(email, password);
            if (await registerResponse == false) {
                // Show error message
                alert("Error registering user");
                return;
            }
            setLoading(true);
            let response = await login(email, password);
            if (response == true) {  
              navigation.navigate('auth/ConnectInfiniteCampus');
            }
          } catch (error) {
            console.error("Error logging in:", error);
          }        
    }

    if (loading) {
        return (
            <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                <ActivityIndicator size='large' color='#BF1B1B'/>
            </View>
        )
    }

    return (
        <PaperProvider>
            <View style={{alignItems: 'center', justifyContent: 'center', flex: 1}}>
                <View style={{width: 300, marginTop: 30}}>
                    <Text className='text-3xl text-center font-bold mb-10'>Registration</Text>
                    <TextInput
                        mode='outlined'
                        value={email}
                        onChangeText={text => setEmail(text)}
                        outlineStyle={{borderRadius: 15, backgroundColor: '#eee', shadowColor: '#000', borderColor: '#eee', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2}}
                        style={{marginBottom: 10}}
                        placeholder='Email'
                        cursorColor='#BF1B1B'
                        selectionColor='#BF1B1B'
                    />
                    <TextInput
                        mode='outlined'
                        value={password}
                        onChangeText={text => setPassword(text)}
                        secureTextEntry={true}
                        outlineStyle={{borderRadius: 15, backgroundColor: '#eee', shadowColor: '#000', borderColor: '#eee', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2}}
                        style={{marginBottom: 10}}
                        placeholder='Password'
                        cursorColor='#BF1B1B'
                        selectionColor='#BF1B1B'
                    />

                    <TextInput
                        mode='outlined'
                        value={repassword}
                        onChangeText={text => setRePassword(text)}
                        secureTextEntry={true}
                        outlineStyle={{borderRadius: 15, backgroundColor: '#eee', shadowColor: '#000', borderColor: '#eee', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2}}
                        style={{marginBottom: 10}}
                        placeholder='Re-enter Password'
                        cursorColor='#BF1B1B'
                        selectionColor='#BF1B1B'
                    />

                    <TouchableOpacity onPress={() => handleLoginPress()}>
                       <View style={{backgroundColor: '#BF1B1B', padding: 15, paddingHorizontal: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center'}}>
                            <Text className='text-white text-xl ml-3 font-bold'>Register</Text>
                        </View>
                   </TouchableOpacity>
                   <TouchableOpacity onPress={() =>{ navigation.goBack()}}><Text className='text-gray-600 text-md mt-5 text-center mb-5'>Already have an account?</Text></TouchableOpacity>
                </View>
            </View>
        </PaperProvider>
    )
}