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

  for (const cls of classTimes["classes"]) {
    const [startHours, startMinutes, startSeconds] = cls["start"].split(':').map(Number);
    const [endHours, endMinutes, endSeconds] = cls["end"].split(':').map(Number);

    const classStartInSeconds = startHours * 3600 + startMinutes * 60 + startSeconds;
    const classEndInSeconds = endHours * 3600 + endMinutes * 60 + endSeconds;
    const totalClassDuration = classEndInSeconds - classStartInSeconds;

    if (currentTimeInSeconds >= classStartInSeconds && currentTimeInSeconds <= classEndInSeconds) {
      const elapsedTime = currentTimeInSeconds - classStartInSeconds;
      const remainingTime = classEndInSeconds - currentTimeInSeconds;
      return { remainingTime, isClassOngoing: true, totalClassDuration, elapsedTime, afterSchool: false };
    } else if (currentTimeInSeconds < classStartInSeconds) {
      const remainingTime = classStartInSeconds - currentTimeInSeconds;
      return { remainingTime, isClassOngoing: false, afterSchool: false };
    }
  }

  return { remainingTime: 0, isClassOngoing: false, afterSchool: true }; 
};

const ClassCountdown = ({ time }) => {
  const initialCalculation = calculateTimes(time);
  const [remainingTime, setRemainingTime] = useState(initialCalculation.remainingTime);
  const [isClassOngoing, setIsClassOngoing] = useState(initialCalculation.isClassOngoing);
  const [totalClassDuration, setTotalClassDuration] = useState(initialCalculation.totalClassDuration || 0);
  const [elapsedTime, setElapsedTime] = useState(initialCalculation.elapsedTime);
  const [afterSchool, setAfterSchool] = useState(initialCalculation.afterSchool);

  useEffect(() => {
    const interval = setInterval(() => {
      const { remainingTime, isClassOngoing, totalClassDuration, elapsedTime, afterSchool } = calculateTimes(time);
      setRemainingTime(remainingTime);
      setIsClassOngoing(isClassOngoing);
      setElapsedTime(elapsedTime);
      setTotalClassDuration(totalClassDuration);
      setAfterSchool(afterSchool);
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [time]);

  return (
    <CountdownCircleTimer
      isPlaying={isClassOngoing}
      duration={totalClassDuration}
      initialRemainingTime={isClassOngoing ? remainingTime : 2000}
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
