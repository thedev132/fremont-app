import getAllPosts from "@/hooks/Posts/getAllPosts";
import Post from "@/hooks/Posts/Post";
import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, FlatList, Dimensions } from "react-native";
import { Card, List } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotificationScreen() {

    const [posts, setPosts] = React.useState<Post[]>([]);
    const [loading, setLoading] = React.useState(false);

    useEffect(() => {
        // Fetch notifications
        const fetchNotifications = async () => {
            setLoading(true);
            let postList = await getAllPosts();
            setPosts(postList);
            setLoading(false);
        }
        fetchNotifications();

    }, []);

    if (loading) {
        return (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size='large' color='#BF1B1B'/>
          </View>
        )
      }

      const screenWidth = Dimensions.get('window').width; // Declare and assign the screenWidth variable
      
      const renderItem = ({ item }) => (
              <Card style={{
                marginVertical: 5,
                width: screenWidth - 50, // Ensuring card width fits within the screen with some margin
                alignSelf: 'center',
                padding: 10,
                borderRadius: 10,
                backgroundColor: 'white',
                elevation: 2, // For Android shadow
                shadowColor: '#000', // For iOS shadow
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 2,
              }}>
          <List.Item
            title={item.title}
            description={item.content}
            titleStyle={{ fontSize: 16, fontWeight: 'bold' }}
            descriptionStyle={{ fontSize: 14, color: '#555' }}
            left={props => <List.Icon {...props} icon="bell-outline" style={{ alignSelf: 'center' }} />} // Centering the icon vertically
          />
        </Card>
      );
    
      return (
        <SafeAreaView style={{ flex: 1, alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <Text className='text-3xl text-center font-bold mt-10'>Announcements</Text>
        <FlatList
            data={posts}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 10 }}
          />
        </SafeAreaView>
      );
    }