import InfiniteCampus from '@/constants/InfiniteCampus';
import Student from '@/constants/InfiniteCampusStudent';
import { useEffect, useState } from 'react';
import { Text, View, Image } from 'react-native';
import { Divider } from 'react-native-paper';
export default function IDCardScreen() {
    let user = new InfiniteCampus('mmortada201', 'Thedevcookie1')
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
        <View style={{flex:1, alignItems: 'center', justifyContent: 'center'}}>
            <Image style={{width: 100, height: 150}} source={{uri: studentInfo?.getProfilePicture()}} />
            <Text style={{color: 'black'}}> {studentInfo?.getFullName()} </Text>
            <Divider />
            <Text style={{color: 'black'}}>Grade: {studentInfo?.getGrade().charAt(0) === '0' ? studentInfo?.getGrade()?.slice(1) : studentInfo?.getGrade()} | Student</Text>
            
  
            
        </View>
    );
}
