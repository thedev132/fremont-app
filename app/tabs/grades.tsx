import InfiniteCampus from '@/hooks/InfiniteCampus/InfiniteCampus';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';


export default function GradesScreen() {
   let [grades, setGrades] = useState([]);
   useEffect(() => {
      const fetchGrades = async () => {
          // Fetch grades from Infinite Campus
          let username = await AsyncStorage.getItem('IFUsername');
          let password = await EncryptedStorage.getItem('IFPassword');
          let user = new InfiniteCampus(username, password);
          let grades = user.getGrades()
      }
      fetchGrades()
   }, []);

   return (
      <View>
            <Text>Grades</Text>
      </View>
   );
}
