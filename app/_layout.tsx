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
import HomeScreen from './tabs/home';
import TabTwoScreen from './tabs/explore';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });


  const Stack = createStackNavigator();

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  const loggedIn = true;

  return (
      <Stack.Navigator
      screenOptions={{
          headerShown: false
      }}>
        {loggedIn ? (
            <Stack.Screen name="tabs" component={TabLayout}/>
        ) : (
          <Stack.Screen name="login" component={LoginScreen} />
        )}

      </Stack.Navigator>
  );
}
