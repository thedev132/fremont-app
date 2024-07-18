import InfiniteCampus from '@/hooks/InfiniteCampus/InfiniteCampus';
import Student from '@/hooks/InfiniteCampus/InfiniteCampusStudent';
import { useEffect, useState } from 'react';
import { Text, View, Image, StyleSheet } from 'react-native';
import { BarcodeCreatorView, BarcodeFormat } from "react-native-barcode-creator";
import Divider from '@/components/Divider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';


export default function IDCardScreen() {

    function stripAfterAtSymbol(inputString) {
        return inputString.split('@')[0];
      }
    
    const [studentInfo, setStudentInfo] = useState<Student>();
    useEffect(() => {

        const fetchData = async () => {
            let email = await AsyncStorage.getItem('IFEmail');
            let password = await EncryptedStorage.getItem('IFPassword');
            let user = new InfiniteCampus(stripAfterAtSymbol(email), password);
            user.login();
            try {
                let student = await user.getStudentInfo();
                setStudentInfo(student);
            } catch (error) {
                // Handle error
            }
        }
        fetchData();

    }, []);

    return (
        <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
            <View style={{alignItems: 'center', marginBottom: 30}}>
                <Image style={{width: 100, height: 150, marginBottom: 20}} source={{uri: studentInfo?.getProfilePicture()}} />
                <Text style={{color: 'black', fontSize: 32}}> {studentInfo?.getFullName()} </Text>
                <Divider width={300} marginVertical={6}/>
                <Text style={{color: 'black'}}>Grade: {studentInfo?.getGrade().charAt(0) === '0' ? studentInfo?.getGrade()?.slice(1) : studentInfo?.getGrade()} | Student</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
                <Image
                style={{width: 48, height: 65, marginRight: 20}}
                source={require('../../assets/images/logo.png')}
                />
                <View style={{alignItems: 'flex-start', marginBottom: 20}}>
                    <Text style={{color: 'black', fontSize: 16}}>Fremont High School </Text>
                    <Text style={{color: 'black', fontSize: 16}}>575 W Fremont Ave, Sunnyvale,</Text>
                    <Text style={{color: 'black', fontSize: 16}}>CA 94087, USA</Text>
                </View>
            </View>



            <BarcodeCreatorView
                value={`${studentInfo?.getStudentID()}`}
                background={'#fff'}
                foregroundColor={'#000000'}
                format={BarcodeFormat.CODE128}
                style={{width: 250, height: 100}}
            />
            <Text style={{color: 'black'}}> {studentInfo?.getStudentID()} </Text>

  
            
        </View>
    );
}
