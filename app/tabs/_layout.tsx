import { Tabs } from 'expo-router';
import React from 'react';

import { AnimatedTabBarNavigator } from "react-native-animated-nav-tab-bar";
import Ionicons from '@expo/vector-icons/Ionicons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import IDCardScreen from './idCard';
import ScheduleScreen from './schedule';
import GradesScreen from './grades';
import NotificationScreen from './posts';
export default function TabLayout() {
  const Tabs = AnimatedTabBarNavigator();

  return (
    <Tabs.Navigator appearance={{floating: true, tabBarBackground: 'rgba(255, 255, 255, 0.8)'}} tabBarOptions={{activeBackgroundColor: '#BF1B1B', activeTintColor: '#fff', inactiveTintColor: "#fff"
    }}>
      <Tabs.Screen name='Schedule' component={ScheduleScreen} options={{
        tabBarIcon: ({ focused, color, size }) => (
            focused ? 
              <MaterialCommunityIcons
              name="clock"
              size={ 24}
              color={color}
              focused={focused}
              />
              : 
      
              <MaterialCommunityIcons
              name="clock-outline"
              size={24}
              color={'black'}
              focused={focused} />
        )}} />
      <Tabs.Screen name='Announcements' component={NotificationScreen} options={{
        tabBarIcon: ({ focused, color, size }) => (
          focused ? 
            <Ionicons
            name="notifications"
            size={24}
            color={color}
            focused={focused}
            />
            : 
    
            <Ionicons
            name="notifications-outline"
            size={24}
            color={'black'}
            focused={focused} />
    )}} />
      <Tabs.Screen name='ID Card'  component={IDCardScreen} options={{
        tabBarIcon: ({ focused, color, size }) => (
          focused ? 
            <FontAwesome
            name="id-card"
            size={ 24}
            color={color}
            focused={focused}
            />
            : 
    
            <FontAwesome
            name="id-card-o"
            size={24}
            color={'black'}
            focused={focused} />
        )}}/>
      <Tabs.Screen name='Gradebook' component={GradesScreen} options={{
        tabBarIcon: ({ focused, color, size }) => (
          focused ? 
            <MaterialCommunityIcons
            name="school"
            size={ 24}
            color={color}
            focused={focused}
            />
            : 
    
            <MaterialCommunityIcons
            name="school-outline"
            size={24}
            color={'black'}
            focused={focused} />
        )}}/>

    </Tabs.Navigator>
  );
}
