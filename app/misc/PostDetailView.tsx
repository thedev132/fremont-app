import React, { useLayoutEffect } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { formatDate } from "@/constants/FormatDate";
import { SafeAreaView } from "react-native-safe-area-context";
import Divider from "@/components/Divider";
import Markdown from "react-native-markdown-display";
import markdownStyles from "@/constants/markdownStyles";
import AsyncStorage from "@react-native-async-storage/async-storage";
import useSWR from "swr";
import { createCachedFetcher } from "../cacheProvider";

export default function PostDetailView({ route, navigation }) {
  const { title, content, date, orgName, id } = route.params;

  useLayoutEffect(() => {
    navigation.setOptions({ title: title });
  }, [navigation, title]);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: "#F9F9F9", paddingHorizontal: 16 }}
    >
      <View style={{ marginBottom: 8 }}>
        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#333" }}>
          {title} {id}
        </Text>
        <Text style={{ fontSize: 14, color: "#666" }}>{orgName}</Text>
        <Text style={{ fontSize: 14, color: "#666" }}>{formatDate(date)}</Text>
      </View>
      <Divider />
      <View style={{ marginTop: 8 }}>
        <ScrollView bounces={false}>
          <Markdown style={markdownStyles}>{content}</Markdown>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
