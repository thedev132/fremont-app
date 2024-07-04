import { Tabs } from 'expo-router';
import React from 'react';

import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AnimatedTabBarNavigator } from "react-native-animated-nav-tab-bar";
import HomeScreen from './home';
import TabTwoScreen from './explore';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
export default function TabLayout() {
  const colorScheme = useColorScheme();
  const Tabs = AnimatedTabBarNavigator();

  return (
    <Tabs.Navigator appearance={{floating: true, tabBarBackground: '#3C3C3C'}} tabBarOptions={{activeBackgroundColor: '#BF1B1B', activeTintColor: '#fff'}}>
      <Tabs.Screen name='schedule' component={HomeScreen} options={{
        tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
                name="clock"
                size={size ? size : 24}
                color={focused ? color : "#fff"}
                focused={focused}
            />
        )}}/>
      <Tabs.Screen name='announcements' component={TabTwoScreen} options={{
        tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons
                name="newspaper-variant-outline"
                size={size ? size : 24}
                color={focused ? color : "#fff"}
                focused={focused}
            />
        )}}/>
      <Tabs.Screen name='id' component={TabTwoScreen} options={{
        tabBarIcon: ({ focused, color, size }) => (
            <FontAwesome
                name="id-card-o"
                size={size ? size : 24}
                color={focused ? color : "#fff"}
                focused={focused}
            />
        )}}/>
      <Tabs.Screen name='grades' component={TabTwoScreen} options={{
        tabBarIcon: ({ focused, color, size }) => (
            <FontAwesome
                name="book"
                size={size ? size : 24}
                color={focused ? color : "#fff"}
                focused={focused}
            />
        )}}/>

    </Tabs.Navigator>
  );
}
