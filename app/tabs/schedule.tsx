import { Image, StyleSheet, Platform, View, Text } from 'react-native';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useEffect, useState } from 'react';
import InfiniteCampus from '@/constants/InfiniteCampus';
import Course from '@/constants/InfiniteCampusCourse';
import { ScrollView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import formatTime from '@/constants/FormatTime';

export default  function ScheduleScreen() {

  const [uniqueCourses, setUniqueCourses] = useState<Course[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        let courses = await getCourses();
        setUniqueCourses(courses);
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

  let user = new InfiniteCampus('username', 'password')
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
  user.getProfilePicture()
  



  return (
    // create a linear gradient with '#ee0808', '#1602ee'
    <LinearGradient colors={['#1602ee',"#ad10f4", '#ee0808']} style={{flex: 1}}>
      <View style={{alignItems: 'center'}}>
       <SafeAreaView style={{marginTop: 30, width: '100%', alignItems: 'center'}}>
        <View style={{marginBottom: 10}}>  
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
        </View>  

        <ScrollView showsVerticalScrollIndicator={false}  style={{width: '100%', marginBottom: 100}}>
        {
          uniqueCourses.map(course => (
            <View style={{backgroundColor: 'rgba(13, 30, 115, 0.5)', alignItems: 'flex-start', padding: 20, borderRadius: 15, margin: 6, marginHorizontal: 40}}>
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
    </LinearGradient>
  );
}
