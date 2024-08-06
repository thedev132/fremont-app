import Divider from "@/components/Divider";
import { formatDate } from "@/constants/FormatDate";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, ActivityIndicator } from "react-native";

export default function ClubDetails({ route, navigation }) {

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [day, setDay] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(true);

    function formatDayOfWeek(day: number) {
        switch (day) {
            case 0:
                return 'Monday';
            case 1:
                return 'Tuesday';
            case 2:
                return 'Wednesday';
            case 3:
                return 'Thursday';
            case 4:
                return 'Friday';
            case 5:
                return 'Saturday';
            case 6:
                return 'Sunday';
            default:
                return '';
        }
    }


    useEffect(() => {
        const { id, name, description, day, time, location } = route.params;
        const fetchData = async () => {
            try {
                let accessToken = await AsyncStorage.getItem('accessToken');
                console.log(accessToken)
                let response = await fetch(`https://fremont-app-backend.vercel.app/api/orgs/${id}/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        "Authorization": `Bearer ${accessToken}`, // Add this line for authorization
                    },
                });
                let data = await response.json();
                console.log(data)
                setName(name);
                setDescription(data.description);
                setDay(data.day);
                setTime(data.time);
                setLocation(data.location);
            } catch (error) {
                console.error('Error fetching organization:', error);
            }
        }
        if (description == "fetch") {
            fetchData().then(() => setLoading(false));
        }
        else {
            setLoading(false);
            setName(name);
            setDescription(description);
            setDay(day);
            setTime(time);
            setLocation(location);
        }
    });

    if (loading) {
        return (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size='large' color='#BF1B1B'/>
          </View>
        )
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F9F9F9', padding: 16 }}>
            <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>{name}</Text>
                {day == null && time == null && location == null ? null : 
                location !== null ?
                <Text style={{ fontSize: 14, color: '#666' }}>{formatDayOfWeek(Number(day))} {time} @ {location}</Text>
                :
                <Text style={{ fontSize: 14, color: '#666' }}>{formatDayOfWeek(Number(day))} {time}</Text>
                }
            </View>
            <Divider />
            <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 16, lineHeight: 24, color: '#333' }}>{description}</Text>
            </View>
        </ScrollView>
    );
}