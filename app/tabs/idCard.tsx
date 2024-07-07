import InfiniteCampus from '@/constants/InfiniteCampus';
import Student from '@/constants/InfiniteCampusStudent';
import { useEffect, useState } from 'react';
import { Text, View, Image } from 'react-native';
export default function IDCardScreen() {
    let user = new InfiniteCampus('username', 'password')
    user.login()
    
    const [studentInfo, setStudentInfo] = useState<Student>();
    useEffect(() => {
        const fetchData = async () => {
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
        <View style={{backgroundColor: '#111111'}}>
            <Text style={{color: 'black'}}> hi </Text>
            <Text style={{color: 'black'}}> {studentInfo?.getFirstName()} </Text>
            <Image source={{uri: studentInfo?.getProfilePicture()}} />
            
        </View>
    );
}
