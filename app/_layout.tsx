import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";
import { Text, View, Button, Platform, useColorScheme } from "react-native";
import * as React from "react";
import TabLayout from "./tabs/_layout";
import LoginScreen from "./auth/login";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ConnectIFScreen from "./auth/ConnectInfiniteCampus";
import Register from "./auth/register";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import * as Device from "expo-device";
import UpdateExpoPushToken from "@/hooks/ServerAuth/UpdateExpoPushToken";
import PostDetailView from "./misc/PostDetailView";
import ProfileScreen from "./misc/profile";
import AddClubScreen from "./misc/AddClub";
import ClubDetails from "./misc/ClubDetails";
import useSWR, { SWRConfig } from "swr";
import { createNavigationContainerRef, NavigationContainer, useNavigation } from "@react-navigation/native";
import { lightTheme, theme } from "./theme";
import { NotificationHandler } from "@/components/NotificationHandler";
import { SWRWrapper } from "@/components/SWRWrapper";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
export const navigationRef = createNavigationContainerRef();

export default function RootLayout() {
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [appIsReady, setAppIsReady] = React.useState(false);
  const [expoPushToken, setExpoPushToken] = React.useState("");
  const [notification, setNotification] = React.useState<
    Notifications.Notification | undefined
  >(undefined);
  const notificationListener = React.useRef<Notifications.Subscription>();
  const responseListener = React.useRef<Notifications.Subscription>();
  const Stack = createStackNavigator();

  const fetcher = (...args) => fetch(...args).then((res) => res.json());
  const scheme = useColorScheme();

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });

  const handleNotificationResponse = async (
    response: Notifications.NotificationResponse,
  ) => {
    const data = response.notification.request.content.data;
    const postId = data.data.id;
    // requestAnimationFrame(() => {
    navigationRef.navigate("misc/PostDetailView", {
      id: postId,
    });
    // });
  };

  function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
  }

  async function registerForPushNotificationsAsync() {
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      // alert('Failed to get push token for push notification!');
      return;
    }

    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      let accessToken = await AsyncStorage.getItem("accessToken");
      if (accessToken === null || accessToken === "") {
        return;
      } else {
        UpdateExpoPushToken(pushTokenString);
      }
      return pushTokenString;
    } catch (e: unknown) {
      // handleRegistrationError(`${e}`);
    }
  }

  useEffect(() => {
    registerForPushNotificationsAsync();
    // Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    const loadData = async () => {
      try {
        await SplashScreen.hideAsync();
        const value = await AsyncStorage.getItem("loggedIn");
        if (value === null || value === "false") {
          await AsyncStorage.setItem("loggedIn", "false");
          setLoggedIn(false);
        } else if (value === "true") {
          setLoggedIn(true);
        }
      } catch (e) {
        // Error handling
        console.error("Error while loading data:", e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    };
    loadData();
  }, []);

  const onLayoutRootView = React.useCallback(async () => {
    if (appIsReady) {
      // This tells the splash screen to hide immediately! If we call this after
      // `setAppIsReady`, then we may see a blank screen while the app is
      // loading its initial state and rendering its first pixels. So instead,
      // we hide the splash screen once we know the root view has already
      // performed layout.
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SWRWrapper fetcher={fetcher}>
      <NavigationContainer independent={true} ref={navigationRef} >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          ...TransitionPresets.ModalSlideFromBottomIOS,
          headerBackTitle: "",
        }}
      >
        {loggedIn ? (
          <Stack.Group>
            <Stack.Screen name="tabs" component={TabLayout} />
            <Stack.Group screenOptions={{ presentation: "modal" }}>
              <Stack.Screen
                options={({ route }) => ({
                  title: route.params.name,
                  headerShown: true,
                  headerTitleAlign: "center",
                  headerTintColor: "#fff",
                  headerStyle: { backgroundColor: "#8B0000" },
                })}
                name="misc/PostDetailView"
                component={PostDetailView}
              />
              <Stack.Screen
                name="misc/profile"
                children={({ navigation }) => (
                  <ProfileScreen
                    navigation={navigation}
                    setLoggedIn={setLoggedIn}
                  />
                )}
                options={{
                  headerShown: true,
                  headerTitle: "",
                  headerTransparent: true,
                }}
              />
              <Stack.Screen
                name="misc/AddClub"
                component={AddClubScreen}
                options={{
                  headerShown: true,
                  headerTitle: "",
                  headerTransparent: true,
                }}
              />
              <Stack.Screen
                name="misc/ClubDetails"
                component={ClubDetails}
                options={({ route }) => ({
                  title: route.params.name,
                  headerShown: true,
                  headerTitleAlign: "center",
                  headerTintColor: "#fff",
                  headerStyle: { backgroundColor: "#8B0000" },
                })}
                component={ClubDetails}
              />
            </Stack.Group>
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Group>
              <Stack.Screen name="auth/login" component={LoginScreen} />
            </Stack.Group>

            <Stack.Group screenOptions={{ presentation: "modal" }}>
              <Stack.Screen
                name="auth/register"
                component={Register}
                options={{
                  headerShown: true,
                  headerTransparent: true,
                  headerTitle: "",
                }}
              />
              <Stack.Screen
                name="auth/ConnectInfiniteCampus"
                children={() => (
                  <ConnectIFScreen
                    loggedIn={loggedIn}
                    setLoggedIn={setLoggedIn}
                  />
                )}
              />
            </Stack.Group>
          </Stack.Group>
        )}
      </Stack.Navigator>
      </NavigationContainer>
      <NotificationHandler ref={navigationRef} />
    </SWRWrapper>
  );
}
