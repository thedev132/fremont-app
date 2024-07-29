import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Course from '@/hooks/InfiniteCampus/InfiniteCampusCourse';
import ClassCountdown from '@/components/CountDownTimer';
import formatTime from '@/constants/FormatTime';
import makeUser from '@/hooks/InfiniteCampus/MakeUser';
import Icon from '@expo/vector-icons/MaterialIcons'; // Or another icon set

export default function ScheduleScreen({navigation}) {
  const [uniqueCourses, setUniqueCourses] = useState([]);
  const [classTimes, setClassTimes] = useState({ classes: [] });
  const [loading, setLoading] = useState(true);
  const [isAfterSchool, setIsAfterSchool] = useState(false);
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    const fetchData = async () => {
      try {
        let user = await makeUser();
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
        setLoading(false);
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
        <ActivityIndicator size='large' color='#BF1B1B' />
      </View>
    )
  }

  const iconSize = width > 350 ? 30 : 24; // Adjust size based on screen width

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ position: 'absolute', top: height * 0.06, right: width * 0.08 }}>
        <TouchableOpacity onPress={() => navigation.navigate('misc/profile')}>
          <Icon name="person" size={iconSize} color="#8B0000" />  
        </TouchableOpacity>
      </View>
        
        <View style={{ marginTop: 30, marginBottom: 10 }}>
          <ClassCountdown time={classTimes} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%', marginBottom: 100 }}>
          {uniqueCourses.map((course, index) => (
            <View
              key={index}
              style={{
                backgroundColor: '#8B0000',
                alignItems: 'flex-start',
                padding: 20,
                borderRadius: 15,
                margin: 6,
                marginHorizontal: 40,
                // Shadow for iOS
                // shadowColor: 'black',
                // shadowOffset: { width: 10, height: 10 },
                // shadowOpacity: 1,
                // shadowRadius: 3,
                // Shadow for Android
                // elevation: 2
              }}>
              <Text style={{ color: '#fff' }}>{course.getName()}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {course.getStartTime() !== undefined && course.getEndTime() !== undefined && (
                  <Text style={{ color: '#fff' }}>
                    {formatTime(course.getStartTime())} - {formatTime(course.getEndTime())}
                  </Text>
                )}
                <Text style={{ color: '#fff' }}>
                  {course.getTeacherName().replace(/,/g, '').trim().split(/\s+/)[0]}
                </Text>
                {course.getRoom() !== undefined && (
                  <Text style={{ color: '#fff' }}> • RM: {course.getRoom()}</Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
