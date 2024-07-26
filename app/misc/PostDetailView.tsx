import React from "react";
import { View, Text, ScrollView } from "react-native";
import { formatDate } from "@/constants/FormatDate";
import { SafeAreaView } from "react-native-safe-area-context";
import Divider from "@/components/Divider";

export default function PostDetailView({ route, navigation }) {
    const { name, content, date, orgName } = route.params;
    
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#F9F9F9', padding: 16 }}>
            <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>{name}</Text>
                <Text style={{ fontSize: 14, color: '#666' }}>{orgName}</Text>
                <Text style={{ fontSize: 14, color: '#666' }}>{formatDate(date)}</Text>
            </View>
            <Divider />
            <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 16, lineHeight: 24, color: '#333' }}>{content}</Text>
            </View>
        </SafeAreaView>
    );
}
