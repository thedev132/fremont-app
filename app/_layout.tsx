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

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const [loggedIn, setLoggedIn] = React.useState(false);

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
    };

    if (loaded) {
      loadData();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
      <Stack.Navigator
      screenOptions={{
          headerShown: false
      }}>
        {loggedIn ? (
            <Stack.Screen name="tabs" component={TabLayout}/>
        ) : (
          <Stack.Screen name="login" component={() => <LoginScreen loggedIn={loggedIn} setLoggedIn={setLoggedIn} />} />
        )}

      </Stack.Navigator>
  );
}
