import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import EncryptedStorage from 'react-native-encrypted-storage';
import makeUser from '@/hooks/InfiniteCampus/MakeUser';
import { useLogin } from '@/hooks/InfiniteCampus/InfiniteCampus';

export default function ConnectIFScreen({loggedIn, setLoggedIn}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    async function connect() {
        try {
            // Encrypt the password
            // Store username and encrypted password
            await AsyncStorage.setItem('IFEmail', email);
            await EncryptedStorage.setItem('IFPassword', password);
            let result = await useLogin();
            console.log(result)
            if (result == "password") {
                alert("invalid password")
                return
            }
            else if (result == "captcha") {
                alert("Needs captcha")
                return
            }
            else if (result == "success") {
                await AsyncStorage.setItem('loggedIn', 'true');
                setLoggedIn(true);
            }
            else {
                alert("Invalid credentials")
                return
            }

        } catch (error) {
            console.error('Error storing credentials:', error);
        }
    }

    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text className='text-2xl text-center font-semibold mb-5'>Connect Infinite Campus</Text>
            <View style={{width: 300, marginTop: 30}}>
                <TextInput
                    mode='outlined'
                    value={email}
                    onChangeText={text => setEmail(text)}
                    outlineStyle={{borderRadius: 15, backgroundColor: '#eee', shadowColor: '#000', borderColor: '#eee', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2}}
                    style={{marginBottom: 10}}
                    placeholder='Email'
                    cursorColor='#BF1B1B'
                    selectionColor='#BF1B1B'
                    autoCapitalize='none'
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
                autoCapitalize='none'
                />
                <TouchableOpacity onPress={connect}>
                    <View style={{backgroundColor: '#BF1B1B', padding: 15, paddingHorizontal: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center'}}>
                        <Text className='text-white text-xl ml-3 font-bold'>Connect</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
}
