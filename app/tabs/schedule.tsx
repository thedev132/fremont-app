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
import { ScrollView } from 'react-native-gesture-handler';

export default  function ScheduleScreen() {

  const [uniqueCourses, setUniqueCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('fetching data')
        let courses = await getCourses();
        console.log('courses fetced', courses)
        setUniqueCourses(courses);
        // Process courses
        // Set state
      } catch (error) {
        // Handle error
      }
    };
  
    fetchData();
  }, []);
  

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
  
function formatTime(timeString) {
    // Create a Date object with an arbitrary date to parse the time

    if (timeString == undefined) {
      return
    }

    let time = new Date('2000-01-01T' + timeString);
    
    // Extract hours and minutes
    let hours = time.getHours();
    let minutes = time.getMinutes();
    
    // Determine if it's AM or PM
    let period = hours >= 12 ? 'pm' : 'am';
    
    // Convert hours from 24-hour to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // Handle midnight case (0 hours)
    
    // Format minutes with leading zero if necessary
    minutes = minutes < 10 ? '0' + minutes : minutes;
    
    // Construct the formatted time string
    let formattedTime = hours + ':' + minutes + period;
    
    return formattedTime;
}



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

        <ScrollView style={{width: '100%', marginBottom: 20}}>
        {
          uniqueCourses.map(course => (
            <View style={{backgroundColor: '#8a8a8a', alignItems: 'flex-start', padding: 20, borderRadius: 15, margin: 10}}>
              <Text style={{color: '#fff'}}>{course.getName()}</Text>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>

                {course.getStartTime() != undefined && course.getEndTime() != undefined && (
                  <Text style={{color: '#fff'}}>{formatTime(course.getStartTime())}-{formatTime(course.getEndTime())} </Text>
                )}
                <Text style={{color: '#fff'}}>{course.getTeacherName().replace(/,/g, '').trim().split(/\s+/)[0]}</Text>
                
                {course.getRoom() != undefined && (
                  <Text style={{color: '#fff'}}> • RM: {course.getRoom()}</Text>
                )}
              </View>
            </View>
          ))
          
        }
        </ScrollView>
          </SafeAreaView>
      </View>

      

  );
}
