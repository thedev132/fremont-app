import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  RefreshControl,
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
import { isWeekend } from "@/constants/utils";
import { CourseCard } from "@/components/CourseCard";

interface ScheduleState {
  uniqueCourses: Course[];
  classTimes: {
    classes: { start: string; end: string }[];
  };
  loading: boolean;
  noSchoolToday: boolean;
  coursesReleased: boolean;
  rerenderClock: number;
  termName: string;
  error: string | null;
}

const LoadingSpinner: React.FC = React.memo(() => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#BF1B1B" />
  </View>
));

const ProfileButton: React.FC<{ navigation: any; iconSize: number }> = React.memo(
  ({ navigation, iconSize }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate("misc/profile")}
      style={styles.profileButton}
    >
      <Icon name="person" size={iconSize} color="#8B0000" />
    </TouchableOpacity>
  )
);

const NoCoursesView: React.FC<{ termName: string }> = React.memo(({ termName }) => (
  <View style={styles.centerContainer}>
    <Text style={styles.headerText}>
      Courses have not been released yet!
    </Text>
    <Text style={styles.subText}>
      Check back after {termName === "T1" ? "Firebird Fiesta" : "Break"}
    </Text>
  </View>
));

const CourseList: React.FC<{ 
  courses: Course[],
  onRefresh: () => Promise<void>,
  refreshing: boolean
}> = React.memo(({ courses, onRefresh, refreshing }) => (
  <ScrollView
    showsVerticalScrollIndicator={false}
    style={styles.courseList}
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }
  >
    {courses.map((course, index) => (
      <CourseCard key={`${course.getName()}-${index}`} course={course} />
    ))}
  </ScrollView>
));

const ErrorView: React.FC<{ message: string }> = React.memo(({ message }) => (
  <View style={styles.centerContainer}>
    <Text style={styles.errorText}>{message}</Text>
  </View>
));

export default function ScheduleScreen({ navigation }) {
  const { width, height } = Dimensions.get("window");
  const theme = useTheme();
  const date = useMemo(() => new Date(), []);
  const formattedDate = useMemo(() => date.toLocaleDateString("en-CA"), [date]);
  const iconSize = useMemo(() => (width > 350 ? 30 : 24), [width]);
  const [refreshing, setRefreshing] = useState(false);
  
  const [state, setState] = useState<ScheduleState>({
    uniqueCourses: [],
    classTimes: { classes: [] },
    loading: true,
    noSchoolToday: false,
    coursesReleased: true,
    rerenderClock: 0,
    termName: "",
    error: null
  });

  const { data: rosterData, mutate: reloadRoster } = useSWR(
    isWeekend() ? null : 
    `https://fuhsd.infinitecampus.org/campus/resources/portal/roster?_expand=%7BsectionPlacements-%7Bterm%7D%7D&_date=${formattedDate}`
  );

  const calendarID = rosterData?.[0]?.calendarID;

  const { data: dayData, mutate: reloadDay } = useSWR(
    calendarID ? 
    `https://fuhsd.infinitecampus.org/campus/resources/calendar/instructionalDay?calendarID=${calendarID}&date=${formattedDate}` :
    null
  );

  const { data: entireSchedule, mutate: reloadEntireSchedule } = useSWR(
    "https://fuhsd.infinitecampus.org/campus/resources/portal/roster?_expand=%7BsectionPlacements-%7Bterm%7D%7D&_crossSite=true",
    { revalidateOnFocus: true, revalidateIfStale: true }
  );

  const { data: studentInfo } = useSWR(
    "https://fuhsd.infinitecampus.org/campus/api/portal/students"
  );

  const updatePushToken = useCallback(async () => {
    try {
      const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
      const pushTokenString = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
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

      if (accessToken !== null) {
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
      setState(prev => ({ ...prev, error: "Failed to update graduation year" }));
    }
  }, []);

  const filterCourses = useCallback((courses: Course[]) => {
    return courses
      .filter(course => {
        const name = course.getName();
        return name && 
               !["FHS Tutorial", "Advisory", "PE Athletics"].includes(name) && 
               !name.includes("Team");
      })
      .sort((a, b) => a.getPeriod() - b.getPeriod());
  }, []);

  const getCourses = useCallback(async () => {
    try {
      let courses: Course[] = [];
      let termName = state.termName;
      let noSchoolToday = state.noSchoolToday;
      let coursesReleased = state.coursesReleased;
  
      if (isWeekend() || noSchoolToday) {
        // Handle weekends/no-school days using entire schedule
        if (!entireSchedule) return [];
        
        const allClasses = useEntireSchedule(entireSchedule);
        courses = filterCourses(allClasses);
        
        // Update state only if necessary
        setState(prev => prev.noSchoolToday !== true 
          ? { ...prev, noSchoolToday: true } 
          : prev
        );
      } else {
        // Handle regular school days
        if (!rosterData || !dayData) return [];
  
        const scheduleData = useSchedule(formattedDate, rosterData, dayData);
        termName = scheduleData.term;
  
        // Handle different schedule states
        if (scheduleData.data === "No courses") {
          setState(prev => ({
            ...prev,
            coursesReleased: false,
            termName: scheduleData.term
          }));
          return [];
        }
  
        if (scheduleData.data === "No school today") {
          const allClasses = useEntireSchedule(entireSchedule);
          courses = filterCourses(allClasses);
          setState(prev => ({
            ...prev,
            noSchoolToday: true,
            termName: scheduleData.term
          }));
          return courses;
        }
  
        // Process regular schedule
        courses = scheduleData.data
          .filter((course: Course) => course?.getName())
          .reduce((acc: Course[], course: Course) => {
            if (!acc.find(c => c.getName() === course.getName())) {
              acc.push(course);
            }
            return acc;
          }, [])
          .sort((a: Course, b: Course) => 
            a.getStartTime().localeCompare(b.getStartTime())
          );
  
        setState(prev => ({
          ...prev,
          noSchoolToday: false,
          coursesReleased: true,
          termName: scheduleData.term
        }));
      }
  
      return courses.filter(course => 
        !["PE Athletics"].includes(course.getName()) && 
        !course.getName().includes("Team")
      );
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to load courses",
        loading: false
      }));
      return [];
    }
  }, [
    entireSchedule,
    rosterData,
    dayData,
    formattedDate,
    state.noSchoolToday,
    state.termName,
    filterCourses
  ]);

  const studentInfoData = useMemo(() => 
    studentInfo ? useStudentInfo(studentInfo) : null,
  [studentInfo]);

  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isLoading = useMemo(
    () => initialLoading || state.loading,
    [initialLoading, state.loading]
  );

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setInitialLoading(true);
        setState(prev => ({ ...prev, loading: true }));
      }
      
      const courses = await getCourses();
      console.log("Courses:", courses);
      if (courses.length > 0) {
        setState(prev => ({
          ...prev,
          uniqueCourses: courses,
          classTimes: {
            classes: courses.map(course => ({
              start: course.getStartTime(),
              end: course.getEndTime()
            }))
          }
        }));
      }
      else {
        reloadEntireSchedule();
      }

      if (courses.length === 0) {
        reloadRoster();
      }

      setState(prev => ({
        ...prev,
        uniqueCourses: courses,
        classTimes: {
          classes: courses
            .filter(course => course.getStartTime() && course.getEndTime())
            .map(course => ({
              start: course.getStartTime(),
              end: course.getEndTime(),
            })),
        },
        loading: false,
        error: null
      }));

      await updatePushToken();
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || "Failed to load schedule"
      }));
    } finally {
      setInitialLoading(false);
      setRefreshing(false);
    }
  }, [getCourses, studentInfoData, updatePushToken]);



  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setState(prev => ({ ...prev, error: null }));
    try {
      await Promise.all([
        reloadRoster(),
        reloadEntireSchedule(),
        reloadDay(),
      ]);
      await loadData(true);
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message || "Refresh failed" }));
    } finally {
      setRefreshing(false);
    }
  }, [reloadRoster, reloadEntireSchedule, reloadDay, loadData]);

  useFocusEffect(
    useCallback(() => {
      setState(prev => ({ ...prev, rerenderClock: prev.rerenderClock + 1 }));
      loadData(true);
    }, [loadData])
  );

  useEffect(() => {
    studentInfoData?.student && updateGradYear(studentInfoData.student)
  }, []);

  useEffect(() => {
    loadData(false);
  }, [rosterData, dayData, entireSchedule, studentInfo, loadData]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#BF1B1B" />
      </View>
    );
  }

  if (!state.coursesReleased) {
    return (
      <SafeAreaView style={styles.container}>
        <ProfileButton navigation={navigation} iconSize={iconSize} />
        <NoCoursesView termName={state.termName} />
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ProfileButton navigation={navigation} iconSize={iconSize} />
        {(isWeekend() || state.noSchoolToday) ? (
          <>
            <Text style={styles.noSchoolText}>No School Today!</Text>
            <CourseList 
              courses={state.uniqueCourses} 
              onRefresh={onRefresh}
              refreshing={refreshing}
            />
          </>
        ) : state.uniqueCourses.length > 0 ? (
          <>
            <View style={styles.countdownContainer}>
              <ClassCountdown
                keyNumber={state.rerenderClock}
                time={state.classTimes}
              />
            </View>
            <CourseList 
              courses={state.uniqueCourses}
              onRefresh={onRefresh}
              refreshing={refreshing}
            />
          </>
        ) : (
          <>
          <Text style={styles.noSchoolText}>No School Today!</Text>
          <CourseList 
            courses={state.uniqueCourses} 
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        </>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  safeArea: {
    flex: 1,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  profileButton: {
    position: "absolute",
    top: Dimensions.get("window").height * 0.06,
    right: Dimensions.get("window").width * 0.08,
    zIndex: 1,
  },
  courseList: {
    width: "100%",
    marginBottom: 100,
  },
  countdownContainer: {
    marginTop: 30,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 10,
  },
  subText: {
    fontSize: 20,
    textAlign: "center",
  },
  noSchoolText: {
    fontSize: 25,
    textAlign: "center",
    marginBottom: 20,
    marginTop: 60,
  },
  errorText: {
    fontSize: 16,
    color: "#BF1B1B",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#BF1B1B",
    borderRadius: 8,
  },
  retryText: {
    color: "white",
    fontWeight: "500",
  }
});