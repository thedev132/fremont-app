import getAllPosts from "@/hooks/Posts/getAllPosts";
import Post from "@/hooks/Posts/Post";
import React, { useEffect } from "react";
import { View, Text, ActivityIndicator, FlatList, Dimensions, TouchableOpacity, RefreshControl } from "react-native";
import { Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import {formatDateMMDD} from "@/constants/FormatDate";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NotificationScreen({ navigation }) {

    const [posts, setPosts] = React.useState<Post[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [refreshing, setRefreshing] = React.useState(false);

    // Fetch notifications
    const fetchNotifications = async () => {
      let storedPosts = await AsyncStorage.getItem('posts');
      if (storedPosts != null) {
        let postList = JSON.parse(storedPosts);
        setPosts(postList);
      }
      else {
        setLoading(true);
        let postList = await getAllPosts();
        setPosts(postList);
        setLoading(false);
      }
    }

    const reloadNotifications = async () => {
      let postList = await getAllPosts();
      setPosts(postList);
      setRefreshing(false);
    }
  

    useEffect(() => {
        fetchNotifications();
        reloadNotifications();
    }, []);

    if (loading) {
        return (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <ActivityIndicator size='large' color='#BF1B1B'/>
          </View>
        )
      }

      const screenWidth = Dimensions.get('window').width; // Declare and assign the screenWidth variable
      
      const renderItem = ({ item }: { item: Post }) => {
        const screenWidth = Dimensions.get('window').width; // Declare and assign the screenWidth variable
      
        return (
          <Card style={{
            marginVertical: 5,
            width: screenWidth - 50, // Ensuring card width fits within the screen with some margin
            alignSelf: 'center',
            padding: 15,
            borderRadius: 10,
            backgroundColor: 'white',
            elevation: 2, // For Android shadow
            shadowColor: '#000', // For iOS shadow
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.3,
            shadowRadius: 2,
          }}>
            <TouchableOpacity onPress={() => navigation.navigate('misc/PostDetailView', { name: item.getTitle(), content: item.getContent(), date: item.getDate(), orgName: item.getOrganization()?.getName() })}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialIcons name="notifications" size={28} color="black" style={{ marginRight: 12 }} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.getTitle()}</Text>
                    <Text style={{ fontSize: 12, color: '#555' }}>{formatDateMMDD(item.getDate() ?? '')}</Text>
                  </View>
                  <Text style={{ marginTop: 5 }}>{item.getOrganization()?.getName() ?? 'No Organization'}</Text>
                </View>
              </View>
            </TouchableOpacity>

          </Card>
        );
      };
      
      
      
    
      return (
        <SafeAreaView style={{ flex: 1, alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <View style={{ position: 'absolute', top: 50, right: 30 }}>
          <TouchableOpacity onPress={() => navigation.navigate('misc/AddClub')}>
             <MaterialIcons name="notification-add" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <Text className='text-3xl text-center font-bold mt-10'>Announcements</Text>
        <FlatList
            data={posts}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ padding: 10 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={reloadNotifications} />
            }
            scrollEnabled={true}
          />
        </SafeAreaView>
      );
    }