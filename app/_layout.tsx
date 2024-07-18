import 'react-native-gesture-handler';import { useFonts } from 'expo-font';
import { Stack, Tabs, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import * as React from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import TabLayout from './tabs/_layout';
import LoginScreen from './login';
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConnectIFScreen from './ConnectInfiniteCampus';
import { Linking } from 'expo-linking';
import Register from './register';
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
    const interval = setInterval(async () => {
      let loggedIn = await AsyncStorage.getItem('loggedIn');
      if (loggedIn === 'true') {
        setLoggedIn(true);
      }
      else {
        setLoggedIn(false);
      }

    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        await SplashScreen.hideAsync();
        const value = await AsyncStorage.getItem('loggedIn');
        const IF = await AsyncStorage.getItem('IF');
        if (IF === 'true') {
          setIF(true);
        }
        else if (IF === 'false') {
          setIF(false);
        }
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
          IF ? (
            <Stack.Screen name="tabs" component={TabLayout} />
          ) : (
            <Stack.Screen
              name="ConnectInfiniteCampus"
              children={() => <ConnectIFScreen IF={IF} setIF={setIF} />}
            />
          )
        ) : (
          <Stack.Group>
            <Stack.Group>
              <Stack.Screen
                name="login"
                component={LoginScreen}
              />
            </Stack.Group>

            <Stack.Group screenOptions={{presentation: 'modal'}}>
              <Stack.Screen name="register" component={Register} options={{headerShown: true, headerTransparent: true, headerTitle: ''}}/>
            </Stack.Group>
          </Stack.Group>
        )}

      </Stack.Navigator>
  );
}
