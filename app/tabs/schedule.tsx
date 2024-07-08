import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import InfiniteCampus from '@/constants/InfiniteCampus';
import Course from '@/constants/InfiniteCampusCourse';
import ClassCountdown from '@/components/CountDownTimer';
import formatTime from '@/constants/FormatTime';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';

export default function ScheduleScreen() {
  const [uniqueCourses, setUniqueCourses] = useState([]);
  const [classTimes, setClassTimes] = useState({ classes: [] });
  const [loading, setLoading] = useState(true); // Loading state


  useEffect(() => {
    const fetchData = async () => {
      try {
        let username = await AsyncStorage.getItem('IFUsername');
        let password = await EncryptedStorage.getItem('IFPassword');
        let user = new InfiniteCampus(username, password);
        await user.login();
        let courses = await getCourses(user);
        setUniqueCourses(courses);

        let newClassTimes = { classes: [] };
        for (let course of courses) {
          let startTime = course.getStartTime();
          let endTime = course.getEndTime();
          if (startTime && endTime) {
            newClassTimes.classes.push({ start: startTime, end: endTime });
          }
        }
        setClassTimes(newClassTimes);
        setLoading(false); 

      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false); // Ensure loading is set to false on error
      }
    };

    fetchData();
  }, []);

  const getCourses = async (user) => {
    try {
      let courses = await user.getSchedule('2024-04-12');
      let uniqueCourses = [];
      let courseMap = {};

      for (let course of courses) {
        if (course instanceof Course) {
          let courseName = course.getName();
          if (courseName && !courseMap[courseName]) {
            courseMap[courseName] = true;
            uniqueCourses.push(course);
          }
        }
      }

      uniqueCourses.sort((a, b) => {
        let timeA = a.getStartTime();
        let timeB = b.getStartTime();
        if (timeA < timeB) return -1;
        if (timeA > timeB) return 1;
        return 0;
      });
      return uniqueCourses;
    } catch (error) {
      console.error('Error getting courses:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <LinearGradient colors={['#12264d', '#2c77d8']} style={{ flex: 1 }}>
      <View style={{ alignItems: 'center' }}>
        <SafeAreaView style={{ marginTop: 30, width: '100%', alignItems: 'center' }}>
          <View style={{ marginBottom: 10 }}>
            <ClassCountdown time={classTimes} />
          </View>
          <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%', marginBottom: 100 }}>
            {uniqueCourses.map((course, index) => (
              <View key={index} style={{ backgroundColor: 'rgba(13, 30, 115, 0.5)', alignItems: 'flex-start', padding: 20, borderRadius: 15, margin: 6, marginHorizontal: 40 }}>
                <Text style={{ color: '#fff' }}>{course.getName()}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {course.getStartTime() !== undefined && course.getEndTime() !== undefined && (
                    <Text style={{ color: '#fff' }}>{formatTime(course.getStartTime())} - {formatTime(course.getEndTime())}</Text>
                  )}
                  <Text style={{ color: '#fff' }}> {course.getTeacherName().replace(/,/g, '').trim().split(/\s+/)[0]}</Text>
                  {course.getRoom() !== undefined && (
                    <Text style={{ color: '#fff' }}> • RM: {course.getRoom()}</Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </View>
    </LinearGradient>
  );
}
