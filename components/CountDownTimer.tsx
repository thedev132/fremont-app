import React, { useState, useEffect } from 'react';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { Text } from 'react-native';


const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    return { hours, minutes, seconds };
  };
  
  const getTimeDifference = (start, end) => {
    const [startHours, startMinutes, startSeconds] = start.split(':').map(Number);
    const [endHours, endMinutes, endSeconds] = end.split(':').map(Number);
  
    const startDate = new Date();
    startDate.setHours(startHours, startMinutes, startSeconds, 0);
  
    const endDate = new Date();
    endDate.setHours(endHours, endMinutes, endSeconds, 0);
  
    const difference = (endDate - startDate) / 1000; // in seconds
    return difference;
  };
  
  const calculateTimes = (classTimes) => {
    const { hours: currentHours, minutes: currentMinutes, seconds: currentSeconds } = getCurrentTime();
    const currentTimeInSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;
    
    for (const cls of classTimes["classes"]) {
      const [startHours, startMinutes, startSeconds] = cls["start"].split(':').map(Number);
      const [endHours, endMinutes, endSeconds] = cls["end"].split(':').map(Number);
  
      const classStartInSeconds = startHours * 3600 + startMinutes * 60 + startSeconds;
      const classEndInSeconds = endHours * 3600 + endMinutes * 60 + endSeconds;
      const totalClassDuration = classEndInSeconds - classStartInSeconds;
  
      if (currentTimeInSeconds >= classStartInSeconds && currentTimeInSeconds <= classEndInSeconds) {
        const elapsedTime = currentTimeInSeconds - classStartInSeconds;
        const remainingTime = classEndInSeconds - currentTimeInSeconds;
        return { remainingTime, isClassOngoing: true, totalClassDuration, elapsedTime };
      } else if (currentTimeInSeconds < classStartInSeconds) {
        const remainingTime = classStartInSeconds - currentTimeInSeconds;
        return { remainingTime, isClassOngoing: false };
      }
    }
    return { remainingTime: 0, isClassOngoing: false }; // No more classes for today
  };
  
  const ClassCountdown = ({ time }) => {
    const initialCalculation = calculateTimes(time);
    const [remainingTime, setRemainingTime] = useState(initialCalculation.remainingTime);
    const [isClassOngoing, setIsClassOngoing] = useState(initialCalculation.isClassOngoing);
    const [totalClassDuration, setTotalClassDuration] = useState(initialCalculation.totalClassDuration || 0);
    const [elapsedTime, setElapsedTime] = useState(initialCalculation.elapsedTime);
  
    useEffect(() => {
      const interval = setInterval(() => {
        const { remainingTime, isClassOngoing, totalClassDuration, elapsedTime } = calculateTimes(time);
        setRemainingTime(remainingTime);
        setIsClassOngoing(isClassOngoing);
        setElapsedTime(elapsedTime);
        setTotalClassDuration(totalClassDuration);
      }, 1000); // Update every second
  
      return () => clearInterval(interval);
    }, [time]);
    
    return (
      <CountdownCircleTimer
        isPlaying = {isClassOngoing}
        duration={totalClassDuration} // duration in seconds
        initialRemainingTime={isClassOngoing ? totalClassDuration - elapsedTime : 2000} // elapsed time in seconds
        colors={['#fc0303', '#0324fc']}
        colorsTime={[totalClassDuration, 0]}
        size={250}
        strokeWidth={16}
        trailStrokeWidth={15}
        trailColor="rgba(255, 255, 255, 0.3)"
        
      >
        {() => (
          <Text style={{color: '#fff', fontSize: 30, textAlign: 'center'}}>
            {isClassOngoing
              ? `${Math.ceil(remainingTime / 60)}:${remainingTime % 60 < 10 ? '0' : ''}${remainingTime % 60}`
              : `Next class in ${Math.ceil(remainingTime / 60)}:${remainingTime % 60 < 10 ? '0' : ''}${remainingTime % 60}`}
          </Text>
        )}
      </CountdownCircleTimer>
    );
  };
  
  export default ClassCountdown;
