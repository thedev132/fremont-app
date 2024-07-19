import 'react-native-gesture-handler';import { useFonts } from 'expo-font';
import { Stack, Tabs, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import * as React from 'react';

import TabLayout from './tabs/_layout';
import LoginScreen from './auth/login';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConnectIFScreen from './auth/ConnectInfiniteCampus';
import { Linking } from 'expo-linking';
import Register from './auth/register';
import { Button } from 'react-native';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {


  const router = useRouter();

  useEffect(() => {
    const handleDeepLink = (event) => {
      const url = event.url;
      if (url) {
        const { path, queryParams } = Linking.parse(url);
        // Navigate to the correct route with the path and queryParams
        console.log(path, queryParams);
        // router.push({ pathname: `/${path}`, queryParams });
      }
    };

    

  }, [router]);

  const [loggedIn, setLoggedIn] = React.useState(false);
  const [IF, setIF] = React.useState(false);
  const [appIsReady, setAppIsReady] = React.useState(false);


  const Stack = createStackNavigator();



  useEffect(() => {
    const loadData = async () => {
      try {
        await SplashScreen.hideAsync();
        const value = await AsyncStorage.getItem('loggedIn');
        if (value === null || value === 'false') {
          await AsyncStorage.setItem('loggedIn', 'false');
          setLoggedIn(false);
        }
        else if (value === 'true') {
          setLoggedIn(true);
        }
        
      } catch (e) {
        // Error handling
        console.error('Error while loading data:', e);
      }
      finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    };
    loadData();


  }, []);

  const onLayoutRootView = React.useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          ...TransitionPresets.ModalSlideFromBottomIOS,
        }}>
       {loggedIn ? (
            <Stack.Screen name="tabs" component={TabLayout} />
        ) : (
          <Stack.Group>
            <Stack.Group>
              <Stack.Screen
                name="auth/login"
                component={LoginScreen}
              />
            </Stack.Group>

            <Stack.Group screenOptions={{presentation: 'modal'}}>
              <Stack.Screen name="auth/register" component={Register} options={{headerShown: true, headerTransparent: true, headerTitle: ''}}/>
              <Stack.Screen
              name="auth/ConnectInfiniteCampus"
              children={() => <ConnectIFScreen loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}
            />
            </Stack.Group>
          </Stack.Group>
        )}

      </Stack.Navigator>
  );
}
