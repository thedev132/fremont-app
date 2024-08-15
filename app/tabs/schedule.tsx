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
  const [noSchoolToday, setNoSchoolToday] = useState(false);
  const { width, height } = Dimensions.get('window');
  const [coursesReleased, setCoursesReleased] = useState(true);

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
      const date = new Date();
      const formattedDate = date.toISOString().split('T')[0];
      let courses = await user.getSchedule(formattedDate);
      if (courses == "No courses") {
        setCoursesReleased(false);
        return [];
      }
      if (courses == "No school today") {
        let allClasses = await user.getEntireSchedule()
        setNoSchoolToday(true)
        return allClasses;
      }
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

  if (!coursesReleased) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center' }}>
          <View style={{ position: 'absolute', top: height * 0.06, right: width * 0.08, zIndex: 1 }}>
            <TouchableOpacity onPress={() => navigation.navigate('misc/profile')}>
              <Icon name="person" size={iconSize} color="#8B0000" />
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, textAlign: 'center' }}>Courses have not been released yet!</Text>
            <Text style={{ fontSize: 20, textAlign: 'center' }}>Check back after Firebird Fiesta</Text>
          </View>
      </SafeAreaView>
    ) 
  }
  if (noSchoolToday) {
    // sort classes by period number and if none put it last
    uniqueCourses.sort((a: Course, b: Course) => {
      let periodA = a.getPeriod();
      let periodB = b.getPeriod();
      if (periodA < periodB) return -1;
      if (periodA > periodB) return 1;
      return 0;
    });
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ position: 'absolute', top: height * 0.06, right: width * 0.08, zIndex: 1 }}>
          <TouchableOpacity onPress={() => navigation.navigate('misc/profile')}>
            <Icon name="person" size={iconSize} color="#8B0000" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center', width: '100%', marginTop: 75}}>
          <Text style={{ fontSize: 25, textAlign: 'center', marginBottom: 20 }}>No School Today!</Text>
        <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%', marginBottom: 100}}>
          {uniqueCourses.map((course: Course, index) => (
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
                {course.getTeacherName() !== undefined && (
                  <Text style={{ color: '#fff' }}>
                    {course.getTeacherName() == undefined ? null : `${course.getTeacherName().replace(/,/g, '').trim().split(/\s+/)[1]} ${course.getTeacherName().replace(/,/g, '').trim().split(/\s+/)[0]}` }
                  </Text>
                )}

                {course.getRoom() !== undefined && (
                  <Text style={{ color: '#fff' }}> • RM: {course.getRoom()}</Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>
       </View>
      </SafeAreaView>
    )
  }
  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView style={{ flex: 1, alignItems: 'center' }}>
      <View style={{ position: 'absolute', top: height * 0.06, right: width * 0.08, zIndex: 1 }}>
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
