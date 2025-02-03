import { useNavigation } from "@react-navigation/native";
import { useEffect, useCallback, useMemo } from "react";
import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";

export const NotificationHandler = (ref) => {

  useEffect(() => {
    const responseListener =
      Notifications.addNotificationResponseReceivedListener(
        async (response) => {
          try {
            const data = response.notification.request.content;
            if (!data) {
              console.log("No post ID in notification:", data);
              return;
            }

            requestAnimationFrame(() => {
              ref.navigate("misc/PostDetailView", {
                title: data.title,
                content: data.body,
                date: data.data.date,
                orgName: data.data.org,
              });
            });
          } catch (error) {
            console.error("Error handling notification:", error);
          }
        },
      );

    return () => {
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, [ref]);

  return null;
};
