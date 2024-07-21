import React, { useState, useEffect } from 'react';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { Text } from 'react-native';

const getCurrentTimeInSeconds = () => {
  const now = new Date();
  return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
};

const calculateTimes = (classTimes) => {
  const currentTimeInSeconds = getCurrentTimeInSeconds();
  let isClassOngoing = false;
  let currentClassRemainingTime = 0;
  let nextClassRemainingTime = Infinity; // Initialize to a large value for the next class
  let breakDuration = 0;
  let prevClassEndInSeconds = 0;

  const classData = classTimes["classes"].map(cls => {
    const [startHours, startMinutes, startSeconds] = cls["start"].split(':').map(Number);
    const [endHours, endMinutes, endSeconds] = cls["end"].split(':').map(Number);

    const classStartInSeconds = startHours * 3600 + startMinutes * 60 + startSeconds;
    const classEndInSeconds = endHours * 3600 + endMinutes * 60 + endSeconds;

    if (currentTimeInSeconds >= classStartInSeconds && currentTimeInSeconds <= classEndInSeconds) {
      isClassOngoing = true;
      currentClassRemainingTime = classEndInSeconds - currentTimeInSeconds;
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
  const afterSchool = !isClassOngoing && currentTimeInSeconds > lastClassEnd;

  return {
    currentClassRemainingTime,
    nextClassRemainingTime,
    breakDuration,
    isClassOngoing,
    afterSchool
  };
};

const ClassCountdown = ({ time }) => {
  const initialCalculation = calculateTimes(time);
  const [currentClassRemainingTime, setCurrentClassRemainingTime] = useState(initialCalculation.currentClassRemainingTime);
  const [nextClassRemainingTime, setNextClassRemainingTime] = useState(initialCalculation.nextClassRemainingTime);
  const [breakDuration, setBreakDuration] = useState(initialCalculation.breakDuration);
  const [isClassOngoing, setIsClassOngoing] = useState(initialCalculation.isClassOngoing);
  const [afterSchool, setAfterSchool] = useState(initialCalculation.afterSchool);

  useEffect(() => {
    const interval = setInterval(() => {
      const { currentClassRemainingTime, nextClassRemainingTime, breakDuration, isClassOngoing, afterSchool } = calculateTimes(time);
      setCurrentClassRemainingTime(currentClassRemainingTime);
      setNextClassRemainingTime(nextClassRemainingTime);
      setBreakDuration(breakDuration);
      setIsClassOngoing(isClassOngoing);
      setAfterSchool(afterSchool);
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [time]);

  return (
    <CountdownCircleTimer
      isPlaying={true}
      duration={isClassOngoing ? currentClassRemainingTime : breakDuration}
      initialRemainingTime={isClassOngoing ? currentClassRemainingTime : nextClassRemainingTime}
      colors={['#8B0000', '#8B0000']}
      colorsTime={[0, 0]}
      size={250}
      strokeWidth={16}
      trailStrokeWidth={15}
      trailColor="rgba(233, 233, 233, 1)"
    >
      {() => (
        <Text style={{ color: '#000', fontSize: 30, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Inter-Bold' }}>
          {afterSchool
            ? "After School"
            : isClassOngoing
            ? `${Math.ceil(currentClassRemainingTime / 60)}:${currentClassRemainingTime % 60 < 10 ? '0' : ''}${currentClassRemainingTime % 60}`
            : `Next class in ${'\n'}${Math.ceil(nextClassRemainingTime / 60)}:${nextClassRemainingTime % 60 < 10 ? '0' : ''}${nextClassRemainingTime % 60}`}
        </Text>
      )}
    </CountdownCircleTimer>
  );
};

export default ClassCountdown;
