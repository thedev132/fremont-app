import InfiniteCampus, { useStudentInfo } from '@/hooks/InfiniteCampus/InfiniteCampus';
import Student from '@/hooks/InfiniteCampus/InfiniteCampusStudent';
import { useEffect, useState } from 'react';
import { Text, View, Image } from 'react-native';
import { BarcodeCreatorView, BarcodeFormat } from "react-native-barcode-creator";
import Divider from '@/components/Divider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React from 'react';
import makeUser from '@/hooks/InfiniteCampus/MakeUser';
import useSWR from 'swr';

export default function IDCardScreen() {
    
    const [studentInfo, setStudentInfo] = useState<Student>();
    const [idReleased, setIdReleased] = useState(true);

    const fetcher = async (url: string, options: RequestInit = {}) => {
        const res = await fetch(url, options);
        if (!res.ok) {
          throw new Error(`Error fetching data: ${res.statusText}`);
        }
        return res.json();
      };

    const { data, error } = useSWR(
        "https://fuhsd.infinitecampus.org/campus/api/portal/students",
        fetcher
    );

    const personID = data?.[0]?.personID; // Adjust based on actual structure
    const { data: profilePic, mutate: reloadProfile } = useSWR(
    personID
        ? `https://fuhsd.infinitecampus.org/campus/personPicture.jsp?personID=${personID}&alt=teacherApp&img=large`
        : null,
    async (url) => {
        const res = await fetch(url, { method: "GET" });
        const blob = await res.blob();
        return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
        });
    })
    useEffect(() => {

        const fetchData = async () => {
            // let user = await makeUser();
            // user.login();
            try {
                let student = useStudentInfo(data).student;
                if (student == "No ID") {
                    setIdReleased(false);
                    return;
                }
                setStudentInfo(student);
            } catch (error) {
                // Handle error
            }
        }
        fetchData();
        console.log(studentInfo);
        reloadProfile();
        console.log(profilePic)

    }, []);

    if (!idReleased) {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text style={{ fontSize: 20, textAlign: 'center' }}>Your ID Card hasn't been posted yet!</Text>
                <Text style={{ fontSize: 20, textAlign: 'center' }}>Check back after Firebird Fiesta</Text>
            </View>
        )
    }
    return (
        <View style={{flex:1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff'}}>
            <View style={{alignItems: 'center', marginBottom: 30}}>
                <Image style={{width: 100, height: 150, marginBottom: 20}} source={{uri: profilePic}} />
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
