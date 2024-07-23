import Divider from "@/components/Divider";
import { formatDate } from "@/constants/FormatDate";
import React from "react";
import { ScrollView, View, Text } from "react-native";

export default function ClubDetails({ route, navigation }) {
    const { name, description, day, time, location } = route.params;    
    console.log(day, time, location);
    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#F9F9F9', padding: 16 }}>
            <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>{name}</Text>
                {day == null && time == null && location == null ? null : 
                location !== null ?
                <Text style={{ fontSize: 14, color: '#666' }}>{day} {time} @ {location}</Text>
                :
                <Text style={{ fontSize: 14, color: '#666' }}>{day} {time}</Text>
                }
            </View>
            <Divider />
            <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 16, lineHeight: 24, color: '#333' }}>{description}</Text>
            </View>
        </ScrollView>
    );
}