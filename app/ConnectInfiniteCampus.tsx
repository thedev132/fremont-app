import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Button, TextInput } from 'react-native-paper';
import { sha256 } from 'react-native-sha256';

export default function ConnectIFScreen() {
    let [username, setUsername] = useState('');
    let [password, setPassword] = useState('');

    async function connect() {
        // Connect to Infinite Campus
        // Save credentials to AsyncStorage
        AsyncStorage.setItem('IFUsername', '');
        console.log(await AsyncStorage.getItem('IFUsername'));

    }
 return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <Text style={{marginBottom: 10}}>Would you like to connect Infinite Campus</Text>
        <TextInput onChangeText={text => setUsername(text)} style={{width: 250, marginBottom: 10}} placeholder='Username'></TextInput>
        <TextInput onChangeText={text => setPassword(text)} style={{width: 250}} secureTextEntry={true} placeholder='Password'></TextInput>
        <TouchableOpacity onPress={connect}><Button style={{marginTop: 10, width: 300}} mode='contained'>Connect</Button></TouchableOpacity>
    </View>
 );
}
