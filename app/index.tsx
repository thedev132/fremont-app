import React from 'react';
import { Image, StatusBar, StyleSheet, View, Text } from 'react-native';
import { Button, Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { SafeAreaFrameContext, SafeAreaView } from 'react-native-safe-area-context';


export default function HomeScreen() {
  return (
    <PaperProvider>
        <SafeAreaView></SafeAreaView>
        <View className='container flex justify-center items-center '>
            <View className='flex justify-evenly items-center'>
                <Image
                    className='m-5'
                    source={require('../assets/images/logo.png')}
                />
                <Text className='text-white text-4xl mt-5'>Fremont High School</Text>
                <Text className='text-white text-2xl mt-2'>Home of the firebirds</Text>
            </View>
            <View style={{flexDirection:'row'}}>
                <Image source={require('../assets/images/schoology.png')}/>
                <Text>Sign in with Schoology</Text>
            </View>
        </View>
    </PaperProvider>

    );
}
 