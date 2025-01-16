import { useLogin, useStudentInfo } from '@/hooks/InfiniteCampus/InfiniteCampus';
import Student from '@/hooks/InfiniteCampus/InfiniteCampusStudent';
import { useCallback, useEffect, useState } from 'react';
import { Text, View, Image, ActivityIndicator } from 'react-native';
import { BarcodeCreatorView, BarcodeFormat } from "react-native-barcode-creator";
import Divider from '@/components/Divider';
import React from 'react';
import useSWR from 'swr';
import { useFocusEffect } from 'expo-router';

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

const { data: studentData, isLoading: studentLoad, mutate: reloadStudent } = useSWR(
    "https://fuhsd.infinitecampus.org/campus/api/portal/students",
    fetcher
);

const personID = studentData?.[0]?.personID; 

const { data: profilePic, isLoading: profileLoad, mutate: reloadProfile } = useSWR(
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
    }
);

useEffect(() => {
    const initialize = async () => {
        await useLogin();
    };
    initialize();

    // Update profile picture when student data changes (including personID)
    reloadProfile(personID);

    // Process student info after data is fetched
    if (!studentLoad && studentData) {
    const student = useStudentInfo(studentData).student;
    if (student === "No ID") {
        setIdReleased(false);
        return;
    }
    setStudentInfo(student);
    }
}, [studentLoad, studentData]);

useFocusEffect(
    useCallback(() => {
        reloadProfile(personID);
    }, [])
);

if (studentLoad) {
    return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' color='#BF1B1B' />
    </View>
    );
}

if (!idReleased) {
    return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, textAlign: 'center' }}>Your ID Card hasn't been posted yet!</Text>
        <Text style={{ fontSize: 20, textAlign: 'center' }}>Check back after Firebird Fiesta</Text>
    </View>
    );
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
