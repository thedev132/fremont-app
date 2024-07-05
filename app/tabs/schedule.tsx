import { Image, StyleSheet, Platform, View, Text } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScheduleScreen() {
  const duration = 250;

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
          </SafeAreaView>
      </View>
  );
}
