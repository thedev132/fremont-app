import React from 'react';
import { Image, StatusBar, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Button, Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import { SafeAreaFrameContext, SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <PaperProvider>
      <SafeAreaView style={{flex:1}}>
        <View className='flex justify-between items-center' style={{flex:1}}>
          <View className='flex items-center'>
            <Image
              className='mt-16 mb-10'
              source={require('../assets/images/logo.png')}
            />
            <Text className='text-white text-4xl mt-5 font-bold'>Fremont High School</Text>
            <Text className='text-white text-2xl mt-2 font-semibold'>Home of the firebirds</Text>
          </View>
        </View>
        <TouchableOpacity>
            <View style={{position: 'absolute', bottom: 0, left:0, right: 0,backgroundColor: '#BF1B1B', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 75, flexDirection: 'row', justifyContent: 'center', marginHorizontal: 20}}>
            <Image source={require('../assets/images/schoology.png')}/>
            <Text className='text-white text-xl ml-3 font-bold'>Sign in with Schoology</Text>
            </View>
        </TouchableOpacity>
      </SafeAreaView>
    </PaperProvider>
  );
}