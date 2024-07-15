import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';
import { Image, StatusBar, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Button, Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { SafeAreaFrameContext, SafeAreaView } from 'react-native-safe-area-context';
import RootLayout from './_layout';
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { useAuth, useRequest, useSignInWithProvider } from 'fremont-app-api-hooks';
export default function LoginScreen({loggedIn, setLoggedIn }) {
  

  WebBrowser.maybeCompleteAuthSession();
  const [state, setState] = React.useState(String);

  const url = Linking.useURL();

  const getToken = async (state, code) => {
    const body = new URLSearchParams();
    body.append('code', code);
    body.append('state', state);
    console.log(body.toString());
    let response = await fetch("https://fremont-app-backend.vercel.app/api/auth/o/google/", {
      "headers": {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
      "method": "POST",
    }).then((response) => response.json());
    console.log(response);
  }

  useEffect(() => {
    const handleDeepLink = (event) => {
      const parsedUrl = new URL(event.url);
      const state = decodeURIComponent(parsedUrl.searchParams.get('state'));
      const code = decodeURIComponent(parsedUrl.searchParams.get('code'));
      getToken(state, code);
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => {
      subscription.remove();
    };
  }, []);

  const handleLoginPress = async () => {
    try {
      const response = await fetch('https://fremont-app-backend.vercel.app/api/auth/o/google/?redirect_uri=https%3A%2F%2Ffremont-app-backend.vercel.app%2Fredirect', {cache: "no-store"});
      const data = await response.json();
      const url = data["authorization_url"]; // Adjust based on your API response
      const parsedUrl = new URL(url);
      const state = decodeURIComponent(parsedUrl.searchParams.get('state'));
      console.log(url);
      setState(state);
      WebBrowser.openAuthSessionAsync(url);

    } catch (error) {
      console.error("Error fetching state value:", error);
    }
  };

  return (
    <PaperProvider>
      <SafeAreaView style={{flex:1, backgroundColor: '#1e1e1e'}}>
        <View className='flex justify-between items-center' style={{flex:1}}>
          <View className='flex items-center'>
            <Image
              className='mt-16 mb-10'
              source={require('../assets/images/logo.png')}
            />
            <Text className='text-white text-4xl mt-5 font-bold'>Fremont High School</Text>
            <Text className='text-white text-2xl mt-2 font-semibold'>Home of the firebirds</Text>
          </View>
        </View>
        <View  style={{position: 'absolute', bottom: 0, left:0, right: 0, alignItems: 'center', marginBottom: 50}}>
        <TouchableOpacity onPress={() => handleLoginPress()}>
                <View style={{backgroundColor: '#BF1B1B', padding: 20, paddingHorizontal: 30, borderRadius: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 10}}>
                    <Image source={require('../assets/images/schoology.png')}/>
                    <Text className='text-white text-xl ml-3 font-bold'>Sign in with Schoology</Text>
                </View>
            </TouchableOpacity>
            {/* <TouchableOpacity onPress={() => { AsyncStorage.setItem('loggedIn', 'true'); setLoggedIn(true) }}>
                <View style={{backgroundColor: '#333130', padding: 20, paddingLeft: 35, paddingRight: 64, borderRadius: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start'}}>
                    <Image source={require('../assets/images/guest.png')}/>
                    <Text className='text-white text-xl ml-3 font-bold'>Continue as Guest</Text>
                </View>
            </TouchableOpacity> */}
        </View>
      </SafeAreaView>
    </PaperProvider>
  )
}