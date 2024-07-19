import getAllPosts from "@/hooks/Posts/getAllPosts";
import React, { useEffect } from "react";
import { View, Text } from "react-native";
import { List } from "react-native-paper";

export default function NotificationScreen() {

    useEffect(() => {
        // Fetch notifications
        const fetchNotifications = async () => {
            let posts = await getAllPosts();
            console.log(posts);
        }
        fetchNotifications();

    }, []);
    return (
        <View>
            <Text>Notifications</Text>
            
        </View>
    );
}