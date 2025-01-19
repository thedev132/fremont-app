import getAllPosts from "@/hooks/Posts/getAllPosts";
import Post from "@/hooks/Posts/Post";
import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  FlatList,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { Card } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { formatDateMMDD } from "@/constants/FormatDate";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createCachedFetcher } from "../cacheProvider";
import useSWR from "swr";
import { useFocusEffect } from "expo-router";

export default function NotificationScreen({ navigation }) {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const fetcher = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(url, options);
    if (!res.ok) {
      throw new Error(`Error fetching data: ${res.statusText}`);
    }
    return res.json();
  };
  // SWR to fetch posts
  const {
    data: postData,
    isLoading,
    mutate,
  } = useSWR("https://fremont-app.vercel.app/api/posts/", async () => {
    const accessToken = await AsyncStorage.getItem("accessToken");
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    };
    return fetcher("https://fremont-app.vercel.app/api/posts/", options);
  });

  // Update posts when postData changes
  const updatePosts = async () => {
    console.log("isLoading", isLoading);
    if (postData) {
      const postList = await getAllPosts(postData);
      console.log("postList", postData);
      setPosts(postList);
    }
  };

  useEffect(() => {
    updatePosts();
  }, [postData, isLoading]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await mutate();
    await updatePosts();
    setRefreshing(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      const refreshPosts = async () => {
        // Refresh posts when the screen is focused
        await mutate();
        await updatePosts();
      };
      refreshPosts();
    }, []),
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#BF1B1B" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: Post }) => {
    const screenWidth = Dimensions.get("window").width;

    return (
      <Card
        style={{
          marginVertical: 5,
          width: screenWidth - 50,
          alignSelf: "center",
          padding: 15,
          borderRadius: 10,
          backgroundColor: "white",
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.3,
          shadowRadius: 2,
        }}
      >
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("misc/PostDetailView", {
              title: item.getTitle(),
              content: item.getContent(),
              date: item.getDate(),
              orgName: item.getOrganization()?.getName(),
            })
          }
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons
              name="notifications"
              size={28}
              color="black"
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                  {item.getTitle()}
                </Text>
                <Text style={{ fontSize: 12, color: "#555" }}>
                  {formatDateMMDD(item.getDate() ?? "")}
                </Text>
              </View>
              <Text style={{ marginTop: 5 }}>
                {item.getOrganization()?.getName() ?? "No Organization"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <SafeAreaView
      style={{ flex: 1, alignItems: "center", backgroundColor: "#f5f5f5" }}
    >
      <View style={{ position: "absolute", top: 50, right: 30 }}>
        <TouchableOpacity onPress={() => navigation.navigate("misc/AddClub")}>
          <MaterialIcons name="notification-add" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <Text className="text-3xl text-center font-bold mt-10">
        Announcements
      </Text>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.getId()?.toString() || ""}
        contentContainerStyle={{ padding: 10 }}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        scrollEnabled={true}
      />
    </SafeAreaView>
  );
}
