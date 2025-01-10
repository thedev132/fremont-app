import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Course from '@/hooks/InfiniteCampus/InfiniteCampusCourse';
import ClassCountdown from '@/components/CountDownTimer';
import formatTime from '@/constants/FormatTime';
import makeUser from '@/hooks/InfiniteCampus/MakeUser';
import Icon from '@expo/vector-icons/MaterialIcons'; // Or another icon set
import AsyncStorage from '@react-native-async-storage/async-storage';
import getGraduationYear from '@/constants/getGradYear';
import * as Notifications from 'expo-notifications';
import UpdateExpoPushToken from '@/hooks/ServerAuth/UpdateExpoPushToken';
import Constants from 'expo-constants';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import useSWR from 'swr';
import { useEntireSchedule, useSchedule, useStudentInfo } from '@/hooks/InfiniteCampus/InfiniteCampus';

export default function ScheduleScreen({ navigation }) {
  const [uniqueCourses, setUniqueCourses] = useState([]);

  
  const [classTimes, setClassTimes] = useState({ classes: [] });
  const [loading, setLoading] = useState(true);
  const [noSchoolToday, setNoSchoolToday] = useState(false);
  const {width, height } = Dimensions.get('window');
  const [coursesReleased, setCoursesReleased] = useState(true);
  const [rerenderClock, setRerenderClock] = useState(0);
  const [termName, setTermName] = useState("");

  const date = new Date();
  const formattedDate =  date.toLocaleDateString('en-CA'); 
  const fetcher = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`Error fetching data: ${res.statusText}`);
    }
    return res.json();
  };

  const { data: rosterData, mutate: reloadRoster, error: rosterError } = useSWR(
    `https://fuhsd.infinitecampus.org/campus/resources/portal/roster?_expand=%7BsectionPlacements-%7Bterm%7D%7D&_date=${formattedDate}`,
    fetcher
  );
  const calendarID = rosterData?.[0]?.calendarID;

  const { data: dayData, mutate: reloadDay, error: dayError } = useSWR(
    calendarID
      ? `https://fuhsd.infinitecampus.org/campus/resources/calendar/instructionalDay?calendarID=${calendarID}&date=${formattedDate}`
      : null,
    fetcher
  );

  const { data: entireSchedule, mutate: reloadEntire, error } = useSWR(
    "https://fuhsd.infinitecampus.org/campus/resources/portal/roster?_expand=%7BsectionPlacements-%7Bterm%7D%7D&_crossSite=true",
    fetcher
  );

  const { data: studentInfo, mutate: reloadStudent, studentError } = useSWR(
    "https://fuhsd.infinitecampus.org/campus/api/portal/students",
    fetcher
);

  const fetchData = async () => {
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    const pushTokenString = (
      await Notifications.getExpoPushTokenAsync({
        projectId,
      })
    ).data;
    let accessToken = await AsyncStorage.getItem('accessToken');
    if (accessToken !== null && accessToken !== '') {
      UpdateExpoPushToken(pushTokenString);
    }

    let gradYear = await AsyncStorage.getItem('gradYear');
    if (gradYear === null) {
      let studentInfoData = await useStudentInfo(studentInfo);
      let student = studentInfoData.student;
      if (student !== "No ID") {
        await AsyncStorage.setItem('gradYear', student.getGrade());
        let year = getGraduationYear(Number(student.getGrade()));
        await fetch("https://fremont-app.vercel.app/api/users/me/", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ grad_year: year }),
        });
      }
    }

      let courses = await getCourses();
      console.log(courses);
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
  };

  const getCourses = async () => {
    try {
    
      let scheduleData = await useSchedule(formattedDate, rosterData, dayData);
      let courses = scheduleData.data;
      const termData = await useSchedule(formattedDate, rosterData, dayData);
      setTermName(scheduleData.term);
      console.log(courses);
      if (courses === "No courses") {
        setCoursesReleased(false);
        return [];
      }
      if (courses === "No school today") {
        let allClasses = useEntireSchedule(entireSchedule);
        setNoSchoolToday(true);
        let filteredCourses = allClasses.filter((course: Course) => {
          return course.getName() !== "FHS Tutorial" && course.getName() !== "Advisory";
        });
        filteredCourses.sort((a: Course, b: Course) => {
          let periodA = a.getPeriod();
          let periodB = b.getPeriod();
          return periodA - periodB;
        });
        return filteredCourses;
      }
      setNoSchoolToday(false);
      setCoursesReleased(true);

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

      //filter out PE Athletics as it is not a class
      uniqueCourses = uniqueCourses.filter((course) => {
        return course.getName() !== "PE Athletics" && course.getName()?.includes("Team") === false;
      });

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

  useFocusEffect(
    useCallback(() => {
      setRerenderClock((prev) => prev + 1);
      fetchData();
    }, [])
  );

  useEffect(() => { 
    reloadRoster();
    reloadDay();
    reloadEntire();
    reloadStudent();
    const interval = setInterval(() => {
      setRerenderClock((prev) => prev + 1);
      fetchData();
    }, 60000);
    return () => clearInterval(interval);
  }
  , []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' color='#BF1B1B' />
      </View>
    );
  }

  const iconSize = width > 350 ? 30 : 24;

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
          <Text style={{ fontSize: 20, textAlign: 'center' }}>Check back after {termName == "T1" ? "Firebird Fiesta" : "Break"}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (noSchoolToday) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center' }}>
        <View style={{ position: 'absolute', top: height * 0.06, right: width * 0.08, zIndex: 1 }}>
          <TouchableOpacity onPress={() => navigation.navigate('misc/profile')}>
            <Icon name="person" size={iconSize} color="#8B0000" />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, alignItems: 'center', width: '100%', marginTop: 75 }}>
          <Text style={{ fontSize: 25, textAlign: 'center', marginBottom: 20 }}>No School Today!</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%', marginBottom: 100 }}>
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
                }}>
                <Text style={{ color: '#fff' }}>{course.getName()}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {course.getTeacherName() !== undefined && (
                    <Text style={{ color: '#fff' }}>
                      {course.getTeacherName()?.replace(/,/g, '').trim().split(/\s+/).reverse().join(' ').replace(/^(\S+)\s(\S+)\s(.+)/, '$2 $1 $3')}
                    </Text>
                  )}
                  {course.getRoom() !== undefined && course.getRoom() !== "" && (
                    <Text style={{ color: '#fff' }}> • RM: {course.getRoom()}</Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    );
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
          <ClassCountdown keyNumber={rerenderClock} time={classTimes} />
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
                {' '}{course.getTeacherName()?.replace(/,/g, '').trim().split(/\s+/)[0]}
                </Text>
                {course.getRoom() !== undefined && course.getRoom() !== "" && (
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
