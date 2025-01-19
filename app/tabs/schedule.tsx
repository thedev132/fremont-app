import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Course from "@/hooks/InfiniteCampus/InfiniteCampusCourse";
import ClassCountdown from "@/components/CountDownTimer";
import Icon from "@expo/vector-icons/MaterialIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import getGraduationYear from "@/constants/getGradYear";
import * as Notifications from "expo-notifications";
import UpdateExpoPushToken from "@/hooks/ServerAuth/UpdateExpoPushToken";
import Constants from "expo-constants";
import { useFocusEffect, useTheme } from "@react-navigation/native";
import useSWR from "swr";
import {
  useEntireSchedule,
  useSchedule,
  useStudentInfo,
} from "@/hooks/InfiniteCampus/InfiniteCampus";
import { createCachedFetcher } from "../cacheProvider";
import { CourseCard } from "@/components/CourseCard";
import { isWeekend } from "@/constants/utils";

// Memoized components
const LoadingSpinner = React.memo(() => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f5f5f5",
    }}
  >
    <ActivityIndicator size="large" color="#BF1B1B" />
  </View>
));

const ProfileButton = React.memo(({ navigation, iconSize }) => (
  <TouchableOpacity onPress={() => navigation.navigate("misc/profile")}>
    <Icon name="person" size={iconSize} color="#8B0000" />
  </TouchableOpacity>
));

const NoCoursesView = React.memo(({ termName }) => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontSize: 20, textAlign: "center" }}>
      Courses have not been released yet!
    </Text>
    <Text style={{ fontSize: 20, textAlign: "center" }}>
      Check back after {termName === "T1" ? "Firebird Fiesta" : "Break"}
    </Text>
  </View>
));

const CourseList = React.memo(({ courses }) => (
  <ScrollView
    showsVerticalScrollIndicator={false}
    style={{ width: "100%", marginBottom: 100 }}
  >
    {courses.map((course, index) => (
      <CourseCard key={`${course.getName()}-${index}`} course={course} />
    ))}
  </ScrollView>
));

export default function ScheduleScreen({ navigation }) {
  const { width, height } = Dimensions.get("window");
  const date = useMemo(() => new Date(), []);
  const formattedDate = useMemo(() => date.toLocaleDateString("en-CA"), [date]);
  const iconSize = useMemo(() => (width > 350 ? 30 : 24), [width]);

  const [state, setState] = useState<{
    uniqueCourses: any[];
    classTimes: { classes: { start: any; end: any }[] };
    loading: boolean;
    noSchoolToday: boolean;
    coursesReleased: boolean;
    rerenderClock: number;
    termName: string;
  }>({
    uniqueCourses: [],
    classTimes: { classes: [] },
    loading: true,
    noSchoolToday: false,
    coursesReleased: true,
    rerenderClock: 0,
    termName: "",
  });

  const cachedFetcher = useMemo(() => createCachedFetcher(), []);

  // Combine all SWR calls
  const { data: rosterData, mutate: reloadRoster } = useSWR(
    isWeekend()
      ? null
      : `https://fuhsd.infinitecampus.org/campus/resources/portal/roster?_expand=%7BsectionPlacements-%7Bterm%7D%7D&_date=${formattedDate}`,
    cachedFetcher,
    { suspense: false },
  );

  const calendarID = rosterData?.[0]?.calendarID;

  const { data: dayData } = useSWR(
    calendarID
      ? `https://fuhsd.infinitecampus.org/campus/resources/calendar/instructionalDay?calendarID=${calendarID}&date=${formattedDate}`
      : null,
    cachedFetcher,
    { suspense: false },
  );

  const { data: entireSchedule } = useSWR(
    "https://fuhsd.infinitecampus.org/campus/resources/portal/roster?_expand=%7BsectionPlacements-%7Bterm%7D%7D&_crossSite=true",
    cachedFetcher,
    { suspense: false },
  );

  const { data: studentInfo } = useSWR(
    "https://fuhsd.infinitecampus.org/campus/api/portal/students",
    cachedFetcher,
    { suspense: false },
  );

  const updatePushToken = useCallback(async () => {
    try {
      const projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({ projectId })
      ).data;
      const accessToken = await AsyncStorage.getItem("accessToken");
      if (accessToken) {
        await UpdateExpoPushToken(pushTokenString);
      }
    } catch (error) {
      console.error("Error updating push token:", error);
    }
  }, []);

  const updateGradYear = useCallback(async (student) => {
    try {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const year = getGraduationYear(Number(student.getGrade()));
      await AsyncStorage.setItem("gradYear", student.getGrade());

      if (accessToken) {
        await fetch("https://fremont-app.vercel.app/api/users/me/", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ grad_year: year }),
        });
      }
    } catch (error) {
      console.error("Error updating grad year:", error);
    }
  }, []);

  const getCourses = useCallback(async () => {
    if (isWeekend()) {
      const allClasses = useEntireSchedule(entireSchedule);
      setState((prev) => ({ ...prev, noSchoolToday: true }));
      return allClasses
        .filter(
          (course) =>
            !["FHS Tutorial", "Advisory", "PE Athletics"].includes(
              course.getName(),
            ) && !course.getName()?.includes("Team"),
        )
        .sort((a, b) => a.getPeriod() - b.getPeriod());
    }

    if (!rosterData || !dayData) return [];

    const scheduleData = useSchedule(formattedDate, rosterData, dayData);
    setState((prev) => ({ ...prev, termName: scheduleData.term }));
    let courses = scheduleData.data;

    if (courses === "No courses") {
      setState((prev) => ({ ...prev, coursesReleased: false }));
      return [];
    }

    if (courses === "No school today") {
      const allClasses = useEntireSchedule(entireSchedule);
      setState((prev) => ({ ...prev, noSchoolToday: true }));
      return allClasses
        .filter(
          (course) =>
            !["FHS Tutorial", "Advisory", "PE Athletics"].includes(
              course.getName(),
            ) && !course.getName()?.includes("Team"),
        )
        .sort((a, b) => a.getPeriod() - b.getPeriod());
    }

    setState((prev) => ({
      ...prev,
      noSchoolToday: false,
      coursesReleased: true,
    }));

    const uniqueCoursesMap = new Map();
    if (Array.isArray(courses)) {
      courses.forEach((course) => {
        if (course instanceof Course && course.getName()) {
          uniqueCoursesMap.set(course.getName(), course);
        }
      });
    }

    return Array.from(uniqueCoursesMap.values())
      .filter(
        (course) =>
          course.getName() !== "PE Athletics" &&
          !course.getName()?.includes("Team"),
      )
      .sort((a, b) => (a.getStartTime() < b.getStartTime() ? -1 : 1));
  }, [rosterData, dayData, entireSchedule, formattedDate]);

  const fetchData = useCallback(async () => {
    try {
      const courses = await getCourses();

      setState((prev) => ({
        ...prev,
        uniqueCourses: courses,
        classTimes: {
          classes: courses
            .filter((course) => course.getStartTime() && course.getEndTime())
            .map((course) => ({
              start: course.getStartTime(),
              end: course.getEndTime(),
            })),
        },
        loading: false,
      }));
      if (studentInfo) {
        const studentInfoData = useStudentInfo(studentInfo);
        await updateGradYear(studentInfoData.student);
      }
      await updatePushToken();
    } catch (error) {
      console.error("Error in fetchData:", error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [studentInfo, getCourses, updatePushToken, updateGradYear]);

  useFocusEffect(
    useCallback(() => {
      setState((prev) => ({ ...prev, rerenderClock: prev.rerenderClock + 1 }));
      fetchData();
    }, [fetchData]),
  );

  useEffect(() => {
    if (rosterData && dayData && entireSchedule && studentInfo) {
      fetchData();
    }
  }, [rosterData, dayData, entireSchedule, studentInfo, fetchData]);

  if (!entireSchedule || state.loading) {
    return <LoadingSpinner />;
  }

  if (!isWeekend) {
    if (
      !rosterData ||
      !dayData ||
      state.uniqueCourses.length === 0 ||
      state.loading
    ) {
      return <LoadingSpinner />;
    }
  }

  if (!state.coursesReleased) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center" }}>
        <View
          style={{
            position: "absolute",
            top: height * 0.06,
            right: width * 0.08,
            zIndex: 1,
          }}
        >
          <ProfileButton navigation={navigation} iconSize={iconSize} />
        </View>
        <NoCoursesView termName={state.termName} />
      </SafeAreaView>
    );
  }

  if (isWeekend() || state.noSchoolToday) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center" }}>
        <View
          style={{
            position: "absolute",
            top: height * 0.06,
            right: width * 0.08,
            zIndex: 1,
          }}
        >
          <ProfileButton navigation={navigation} iconSize={iconSize} />
        </View>
        <Text
          style={{
            fontSize: 25,
            textAlign: "center",
            marginBottom: 20,
            marginTop: 60,
          }}
        >
          No School Today!!
        </Text>
        <CourseList courses={state.uniqueCourses} />
      </SafeAreaView>
    );
  } else if (state.uniqueCourses.length != 0) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
        <SafeAreaView style={{ flex: 1, alignItems: "center" }}>
          <View
            style={{
              position: "absolute",
              top: height * 0.06,
              right: width * 0.08,
              zIndex: 1,
            }}
          >
            <ProfileButton navigation={navigation} iconSize={iconSize} />
          </View>
          <View style={{ marginTop: 30, marginBottom: 10 }}>
            <ClassCountdown
              keyNumber={state.rerenderClock}
              time={state.classTimes}
            />
          </View>
          <CourseList courses={state.uniqueCourses} />
        </SafeAreaView>
      </View>
    );
  }
}
