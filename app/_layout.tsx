import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, Tabs } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import * as React from 'react';

import { useColorScheme } from '@/hooks/useColorScheme';
import TabLayout from './tabs/_layout';
import LoginScreen from './login';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConnectIFScreen from './ConnectInfiniteCampus';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loggedIn, setLoggedIn] = React.useState(false);
  const [IF, setIF] = React.useState(false);
  const [appIsReady, setAppIsReady] = React.useState(false);


  const Stack = createStackNavigator();
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
          headerShown: false
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
          <Stack.Screen
            name="login"
            children={() => <LoginScreen loggedIn={loggedIn} setLoggedIn={setLoggedIn} />}
          />
        )}

      </Stack.Navigator>
  );
}
