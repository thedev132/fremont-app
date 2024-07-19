import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';
import { Image, StatusBar, StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Button, Provider as PaperProvider, DefaultTheme, TextInput } from 'react-native-paper';
import { SafeAreaFrameContext, SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { getToken } from '@/hooks/ServerAuth/GoogleLoginHelper';
import { login } from '@/hooks/ServerAuth/ManuelLoginHelper';


export default function LoginScreen({navigation}) {

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  WebBrowser.maybeCompleteAuthSession();

  useEffect(() => {
    const handleDeepLink = (event) => {
      const parsedUrl = new URL(event.url);
      const state = decodeURIComponent(parsedUrl.searchParams.get('state'));
      const code = decodeURIComponent(parsedUrl.searchParams.get('code'));
      getToken(state, code);
      setLoading(true);
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => {
      subscription.remove();
    };
  }, []);

  const handleGoogleLoginPress = async () => {
    try {
      const response = await fetch('https://fremont-app-backend.vercel.app/api/auth/o/google/?redirect_uri=https%3A%2F%2Ffremont-app-backend.vercel.app%2Fredirect', {cache: "no-store"});
      const data = await response.json();
      const url = data["authorization_url"]; 
      const parsedUrl = new URL(url);
      console.log(url);
      WebBrowser.openAuthSessionAsync(url);

    } catch (error) {
      console.error("Error fetching state value:", error);
    }
  };

  const handleLoginPress = async () => {
    try {
      let response = await login(email, password);
      if (response) {
        await AsyncStorage.setItem('loggedIn', 'true');
        // trigger a loading screen
        setLoading(true);

      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  if (loading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size='large' color='#BF1B1B'/>
      </View>
    )
  }
  
  return (
    <PaperProvider>
      <SafeAreaView style={{flex:1, backgroundColor: '#fff'}}>
        <View className='flex items-center' style={{flex:1, marginTop: 50}}>
          <View className='flex items-center'>
            <Image
              className='mt-16 mb-10'
              source={require('../../assets/images/logo.png')}
            />
            <Text className='text-black text-4xl mt-5 font-bold'>Fremont High School</Text>
            <Text className='text-black text-2xl mt-2 font-semibold'>Home of the firebirds</Text>
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
                <TouchableOpacity onPress={() => handleLoginPress()}>
                    <View style={{backgroundColor: '#BF1B1B', padding: 15, paddingHorizontal: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center'}}>
                        <Text className='text-white text-xl ml-3 font-bold'>Login</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() =>{ navigation.navigate("auth/register")}}><Text className='text-gray-600 text-md mt-5 text-center mb-5'>Don't have an account?</Text></TouchableOpacity>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 30}}>
                  <View style={{flex: 1, height: 2, backgroundColor: 'black'}} />
                  <View>
                    <Text style={{width: 50, textAlign: 'center', fontSize: 24, fontWeight: '500'}}>or</Text>
                  </View>
                  <View style={{flex: 1, height: 2, backgroundColor: 'black'}} />
                </View>
                <TouchableOpacity onPress={() => handleGoogleLoginPress()}>
                  <View style={{backgroundColor: '#BF1B1B', padding: 15, paddingHorizontal: 30, borderRadius: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 10}}>
                      <Image source={require('../../assets/images/google.png')}/>
                      <Text className='text-white text-xl ml-3 font-semibold'>Sign in with Google</Text>
                  </View>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </PaperProvider>
  )
}
