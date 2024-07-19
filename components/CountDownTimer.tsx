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
const calculateTimes = (classTimes) => {
  const { hours: currentHours, minutes: currentMinutes, seconds: currentSeconds } = getCurrentTime();
  const currentTimeInSeconds = currentHours * 3600 + currentMinutes * 60 + currentSeconds;

  let totalClassDuration = 0;
  let totalBreakDuration = 0;
  let isClassOngoing = false;
  let remainingTime = 0;
  let elapsedTime = 0;
  let afterSchool = true;

  let prevClassEndInSeconds = 0;

  for (let i = 0; i < classTimes["classes"].length; i++) {
    const cls = classTimes["classes"][i];
    const [startHours, startMinutes, startSeconds] = cls["start"].split(':').map(Number);
    const [endHours, endMinutes, endSeconds] = cls["end"].split(':').map(Number);

    const classStartInSeconds = startHours * 3600 + startMinutes * 60 + startSeconds;
    const classEndInSeconds = endHours * 3600 + endMinutes * 60 + endSeconds;
    const classDuration = classEndInSeconds - classStartInSeconds;

    if (i > 0) {
      // Calculate break duration between the end of the previous class and the start of the current class
      totalBreakDuration += Math.max(0, classStartInSeconds - prevClassEndInSeconds);
    }

    if (currentTimeInSeconds >= classStartInSeconds && currentTimeInSeconds <= classEndInSeconds) {
      const elapsedTimeInClass = currentTimeInSeconds - classStartInSeconds;
      remainingTime = classEndInSeconds - currentTimeInSeconds;
      totalClassDuration = classEndInSeconds - classStartInSeconds; // Set to the duration of the ongoing class
      isClassOngoing = true;
      elapsedTime = elapsedTimeInClass;
      afterSchool = false;
      break;
    } else if (currentTimeInSeconds < classStartInSeconds) {
      remainingTime = classStartInSeconds - currentTimeInSeconds;
      afterSchool = false;
    } else {
      // Only accumulate totalClassDuration if class has ended but not if it is currently ongoing
      if (!isClassOngoing) {
        totalClassDuration += classDuration;
      }
    }

    prevClassEndInSeconds = classEndInSeconds;
  }

  if (isClassOngoing) {
    remainingTime = Math.max(remainingTime, 0);
  }

  return { remainingTime, isClassOngoing, totalClassDuration, elapsedTime, totalBreakDuration, afterSchool };
};


const ClassCountdown = ({ time }) => {
  const initialCalculation = calculateTimes(time);
  const [remainingTime, setRemainingTime] = useState(initialCalculation.remainingTime);
  const [isClassOngoing, setIsClassOngoing] = useState(initialCalculation.isClassOngoing);
  const [totalClassDuration, setTotalClassDuration] = useState(initialCalculation.totalClassDuration);
  const [elapsedTime, setElapsedTime] = useState(initialCalculation.elapsedTime);
  const [totalBreakDuration, setTotalBreakDuration] = useState(initialCalculation.totalBreakDuration);
  const [afterSchool, setAfterSchool] = useState(initialCalculation.afterSchool);

  useEffect(() => {
    const interval = setInterval(() => {
      const { remainingTime, isClassOngoing, totalClassDuration, elapsedTime, totalBreakDuration, afterSchool } = calculateTimes(time);
      setRemainingTime(remainingTime);
      setIsClassOngoing(isClassOngoing);
      setElapsedTime(elapsedTime);
      setTotalClassDuration(totalClassDuration);
      setTotalBreakDuration(totalBreakDuration);
      setAfterSchool(afterSchool);
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [time]);

  return (
    <CountdownCircleTimer
      isPlaying={isClassOngoing}
      duration={isClassOngoing ? totalClassDuration : totalBreakDuration}
      initialRemainingTime={remainingTime}
      colors={['#8B0000', '#8B0000']}
      colorsTime={[totalClassDuration, 0]}
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
            ? `${Math.ceil(remainingTime / 60)}:${remainingTime % 60 < 10 ? '0' : ''}${remainingTime % 60}`
            : `Next class in ${Math.ceil(remainingTime / 60)}:${remainingTime % 60 < 10 ? '0' : ''}${remainingTime % 60}`}
        </Text>
      )}
    </CountdownCircleTimer>
  );
};

export default ClassCountdown;
