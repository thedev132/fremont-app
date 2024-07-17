import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';
import { Image, StatusBar, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Button, Provider as PaperProvider, DefaultTheme, TextInput } from 'react-native-paper';
import { SafeAreaFrameContext, SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { getToken } from '@/hooks/ServerAuth/GoogleLoginHelper';
import { login } from '@/hooks/ServerAuth/ManuelLoginHelper';
export default function LoginScreen({loggedIn, setLoggedIn }) {


  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  WebBrowser.maybeCompleteAuthSession();

  useEffect(() => {
    const handleDeepLink = (event) => {
      const parsedUrl = new URL(event.url);
      const state = decodeURIComponent(parsedUrl.searchParams.get('state'));
      const code = decodeURIComponent(parsedUrl.searchParams.get('code'));
      getToken(state, code);
      setLoggedIn(true);
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
      const url = data["authorization_url"]; // Adjust based on your API response
      const parsedUrl = new URL(url);
      const state = decodeURIComponent(parsedUrl.searchParams.get('state'));
      console.log(url);
      WebBrowser.openAuthSessionAsync(url);

    } catch (error) {
      console.error("Error fetching state value:", error);
    }
  };

  const handleLoginPress = async () => {
    try {
      await login(email, password);
      let accessToken = await AsyncStorage.getItem('accessToken');
      if (accessToken !== null) {
        await AsyncStorage.setItem('loggedIn', 'true');
        setLoggedIn(true);
      }
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };
  return (
    <PaperProvider>
      <SafeAreaView style={{flex:1, backgroundColor: '#fff'}}>
        <View className='flex justify-between items-center' style={{flex:1, marginTop: 50}}>
          <View className='flex items-center'>
            <Image
              className='mt-16 mb-10'
              source={require('../assets/images/logo.png')}
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
                    <View style={{backgroundColor: '#BF1B1B', padding: 15, paddingHorizontal: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginBottom: 10}}>
                        <Text className='text-white text-xl ml-3 font-bold'>Login</Text>
                    </View>
                </TouchableOpacity>
                <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 30}}>
                  <View style={{flex: 1, height: 2, backgroundColor: 'black'}} />
                  <View>
                    <Text style={{width: 50, textAlign: 'center', fontSize: 24, fontWeight: '500'}}>or</Text>
                  </View>
                  <View style={{flex: 1, height: 2, backgroundColor: 'black'}} />
                </View>
                <TouchableOpacity onPress={() => handleGoogleLoginPress()}>
                  <View style={{backgroundColor: '#BF1B1B', padding: 15, paddingHorizontal: 30, borderRadius: 15, alignItems: 'center', flexDirection: 'row', justifyContent: 'flex-start', marginBottom: 10}}>
                      <Image source={require('../assets/images/google.png')}/>
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


const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  input: {
    height: 55,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  inputStyle: { fontSize: 16 },
  labelStyle: { fontSize: 14 },
  placeholderStyle: { fontSize: 16 },
  textErrorStyle: { fontSize: 16 },
});