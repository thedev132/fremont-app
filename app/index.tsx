import { Image, StyleSheet, Platform,  Text, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import React from 'react';

export default function HomeScreen() {
    return (
        <View className="flex-1 items-center justify-center">
            <Text className='text-white'>Home Screen</Text>
        </View>
    );
}
