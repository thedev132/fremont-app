import { Image, StyleSheet, Platform, View, Text } from 'react-native';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useEffect, useState } from 'react';
import InfiniteCampus from '@/constants/InfiniteCampus';
import Course from '@/constants/InfiniteCampusCourse';

export default  function ScheduleScreen() {
  const duration = 250;
  
  let date = new Date()
  const offset = date.getTimezoneOffset()
  date = new Date(date.getTime() - (offset*60*1000))
  let formattedDate = date.toISOString().split('T')[0]

  let user = new InfiniteCampus('mmortada201', 'Thedevcookie1')
  user.login()
  const getCourses = async () => {
    let courses = await user.getSchedule('2024-04-12');
    let uniqueCourses: Course[] = [];
    let courseMap: { [key: string]: boolean } = {};
    
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
      // Assuming `time` is a property of the Course object
      let timeA = a.getStartTime();
      let timeB = b.getStartTime();
      
      // Compare times (assuming time is in format 'HH:MM')
      if (timeA < timeB) return -1;
      if (timeA > timeB) return 1;
      return 0;
  });
  return uniqueCourses;
  };
  
  const [uniqueCourses, setUniqueCourses] = useState<Course[]>([]);

useEffect(() => {
  const fetchCourses = async () => {
    let courses = await getCourses();
    setUniqueCourses(courses); // Assuming you have a state variable and setter for uniqueCourses
  };

  fetchCourses();
}, []);
  return (
      <View style={{backgroundColor: '#1e1e1e', height: '100%', flex: 1, alignItems: 'center'}}>
            <SafeAreaView style={{marginTop: 50}}>
            
            <CountdownCircleTimer
            
              isPlaying
              duration={duration}
              colors={['#fc0303', '#0324fc']}
              colorsTime={[duration, 0]}
              size={250}
              strokeWidth={16}
              trailStrokeWidth={15}
              trailColor='#fff'
            >
              {({ remainingTime }) => <Text>{remainingTime}</Text>}
            </CountdownCircleTimer>
            <Text style={{color: '#fff'}}>Today's Schedule</Text>

        {
          uniqueCourses.map(course => (
            <View style={{backgroundColor: '#1e1e1e', height: '100%', flex: 1, alignItems: 'center'}}>
              <Text style={{color: '#fff'}}>{course.getName()}</Text>
              <Text style={{color: '#fff'}}>{course.getTeacherName()}</Text>
            </View>
          ))
        }
          </SafeAreaView>
      </View>

      

  );
}
