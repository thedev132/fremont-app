import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import EncryptedStorage from 'react-native-encrypted-storage';

export default function ConnectIFScreen({IF, setIF}) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    async function connect() {
        try {
            // Encrypt the password

            // Store username and encrypted password
            await AsyncStorage.setItem('IFUsername', username);
            await EncryptedStorage.setItem('IFPassword', password);
            await AsyncStorage.setItem('IF', 'true');
            setIF(true);

        } catch (error) {
            console.error('Error storing credentials:', error);
        }
    }

    return (
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{marginBottom: 10}}>Would you like to connect to Infinite Campus?</Text>
            <TextInput
                onChangeText={text => setUsername(text)}
                style={{width: 250, marginBottom: 10}}
                placeholder='Username'
            />
            <TextInput
                onChangeText={text => setPassword(text)}
                style={{width: 250}}
                secureTextEntry={true}
                placeholder='Password'
            />
            <TouchableOpacity onPress={connect}>
                <Button style={{marginTop: 10, width: 300}} mode='contained'>
                    Connect
                </Button>
            </TouchableOpacity>
        </View>
    );
}
