import React, { useState, useEffect } from 'react';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { Dimensions, Text } from 'react-native';

const getCurrentTimeInSeconds = () => {
  const now = new Date();
  return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
};

const calculateTimes = (classTimes) => {
  const currentTimeInSeconds = getCurrentTimeInSeconds();
  let isClassOngoing = false;
  let currentClassRemainingTime = 0;
  let nextClassRemainingTime = Infinity;
  let breakDuration = 0;
  let prevClassEndInSeconds = 0;
  let totalClassDuration = 0;

  const classData = classTimes["classes"].map(cls => {
    const [startHours, startMinutes, startSeconds] = cls["start"].split(':').map(Number);
    const [endHours, endMinutes, endSeconds] = cls["end"].split(':').map(Number);

    const classStartInSeconds = startHours * 3600 + startMinutes * 60 + startSeconds;
    const classEndInSeconds = endHours * 3600 + endMinutes * 60 + endSeconds;

    if (currentTimeInSeconds >= classStartInSeconds && currentTimeInSeconds <= classEndInSeconds) {
      isClassOngoing = true;
      currentClassRemainingTime = classEndInSeconds - currentTimeInSeconds;
      totalClassDuration = classEndInSeconds - classStartInSeconds; // Set duration of the ongoing class
    } else if (currentTimeInSeconds < classStartInSeconds) {
      nextClassRemainingTime = Math.min(nextClassRemainingTime, classStartInSeconds - currentTimeInSeconds);
      if (prevClassEndInSeconds > 0) {
        breakDuration = Math.min(breakDuration || Infinity, classStartInSeconds - prevClassEndInSeconds);
      }
    }

    prevClassEndInSeconds = classEndInSeconds;
    return { classStartInSeconds, classEndInSeconds };
  });
  const lastClassEnd = Math.max(...classData.map(cd => cd.classEndInSeconds));
  let afterSchool = !isClassOngoing && currentTimeInSeconds > lastClassEnd;
  if (Number.isNaN(lastClassEnd) || lastClassEnd === -Infinity) {
    afterSchool = true;
  }

  return {
    currentClassRemainingTime,
    nextClassRemainingTime,
    breakDuration,
    isClassOngoing,
    afterSchool,
    totalClassDuration // Return the total class duration
  };
};

const { width, height } = Dimensions.get('window');

const ClassCountdown = ({ time }) => {
  const initialCalculation = calculateTimes(time);
  const [currentClassRemainingTime, setCurrentClassRemainingTime] = useState(initialCalculation.currentClassRemainingTime);
  const [nextClassRemainingTime, setNextClassRemainingTime] = useState(initialCalculation.nextClassRemainingTime);
  const [breakDuration, setBreakDuration] = useState(initialCalculation.breakDuration);
  const [totalClassDuration, setTotalClassDuration] = useState(initialCalculation.totalClassDuration);
  const [isClassOngoing, setIsClassOngoing] = useState(initialCalculation.isClassOngoing);
  const [afterSchool, setAfterSchool] = useState(initialCalculation.afterSchool);

  useEffect(() => {
    const interval = setInterval(() => {
      const { currentClassRemainingTime, nextClassRemainingTime, breakDuration, totalClassDuration, isClassOngoing, afterSchool } = calculateTimes(time);
      setCurrentClassRemainingTime(currentClassRemainingTime);
      setNextClassRemainingTime(nextClassRemainingTime);
      setBreakDuration(breakDuration);
      setTotalClassDuration(totalClassDuration);
      setIsClassOngoing(isClassOngoing);
      setAfterSchool(afterSchool);
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [time]);

  // responsive size and fontSize
  const timerSize = width > 350 ? width * 0.57 : width * 0.8;
  const baseFontSize = width > 350 ? width * 0.06 : width * 0.08;
  const largeFontSize = baseFontSize * 1.2; // Increase the font size for the countdown display


  return (
    <CountdownCircleTimer
      isPlaying={true}
      duration={isClassOngoing ? totalClassDuration : breakDuration}
      initialRemainingTime={isClassOngoing ? currentClassRemainingTime : nextClassRemainingTime}
      colors={['#8B0000', '#8B0000']}
      colorsTime={[0, 0]}
      size={timerSize}
      strokeWidth={timerSize * 0.064} // 16/250 ratio for different sizes
      trailStrokeWidth={timerSize * 0.06} // 15/250 ratio for different sizes
      trailColor="rgba(233, 233, 233, 1)"
      
    >
      {() => (
        <Text style={{ 
          color: '#000', 
          fontSize: afterSchool || isClassOngoing ? largeFontSize : baseFontSize, 
          fontWeight: 'bold', 
          textAlign: 'center', 
          fontFamily: 'Inter-Bold' 
        }}>
          {afterSchool
            ? "After School"
            : isClassOngoing
            ? `${Math.ceil(currentClassRemainingTime / 60 - 1)}:${currentClassRemainingTime % 60 < 10 ? '0' : ''}${currentClassRemainingTime % 60}`
            : `Next class in ${'\n'}${Math.ceil(nextClassRemainingTime / 60 - 1)}:${nextClassRemainingTime % 60 < 10 ? '0' : ''}${nextClassRemainingTime % 60}`}
        </Text>
      )}
    </CountdownCircleTimer>
  );
};

export default ClassCountdown;