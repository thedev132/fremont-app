import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ScrollView,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { DataTable } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import { useGrades, useLogin } from "@/hooks/InfiniteCampus/InfiniteCampus";
import useSWR from "swr";
import React from "react";
import { useFocusEffect } from "expo-router";
import { createCachedFetcher } from "../cacheProvider";

interface Grade {
  taskName: string;
  score: string;
}

interface Grades {
  [subject: string]: Grade[];
}

const GRADE_SCORES = {
  "A+": 97,
  A: 93,
  "A-": 90,
  "B+": 87,
  B: 83,
  "B-": 80,
  "C+": 77,
  C: 73,
  "C-": 70,
  "D+": 67,
  D: 63,
  "D-": 60,
  F: 50,
} as const;

const VALID_GRADES = new Set(Object.keys(GRADE_SCORES));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    marginBottom: 10,
    marginTop: 40,
    height: 50,
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 16,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
    alignSelf: "center",
    width: "100%",
  },
  subjectTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  chart: {
    marginVertical: 4,
    borderRadius: 16,
    alignSelf: "center",
  },
  dataTable: {
    marginTop: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  dataTableHeader: {
    backgroundColor: "#f5f5f5",
  },
});

export default function GradesScreen() {
  const [grades, setGrades] = useState<Grades>({});
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [dropdownItems, setDropdownItems] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [gradesReleased, setGradesReleased] = useState(true);
  const [loading, setLoading] = useState(true);

  const screenWidth = useMemo(() => Dimensions.get("window").width, []);
  const chartWidth = useMemo(
    () => Math.min(screenWidth - 32, 768),
    [screenWidth],
  );

  const fetcher = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const res = await fetch(url, options);
      if (!res.ok) {
        throw new Error(`Error fetching data: ${res.statusText}`);
      }
      return res.json();
    },
    [],
  );

  const cachedFetcher = useMemo(() => createCachedFetcher(), []);

  const {
    data: oldData,
    error,
    isLoading,
  } = useSWR(
    "https://fuhsd.infinitecampus.org/campus/resources/portal/grades/",
    cachedFetcher,
  );

  const { data } = useSWR(
    "https://fuhsd.infinitecampus.org/campus/resources/portal/grades/",
    fetcher,
    { fallbackData: oldData },
  );

  const processGrades = useCallback((rawGrades: any) => {
    if (rawGrades === "No grades") {
      return null;
    }

    return Object.fromEntries(
      Object.entries(rawGrades)
        .filter(([subject]) => !subject.includes("Team"))
        .map(([subject, gradeList]: [string, Grade[]]) => {
          let semesterGradeCount = 1;
          const processedGrades = (gradeList as Grade[]).map((grade) => ({
            ...grade,
            taskName: grade.taskName.startsWith("Semester Grade")
              ? `Semester Grade ${semesterGradeCount++}`
              : grade.taskName,
          }));
          return [subject, processedGrades];
        }),
    );
  }, []);

  const fetchGrades = useCallback(async () => {
    const rawGrades = await useGrades(data);
    const processedGrades = processGrades(rawGrades);

    if (!processedGrades) {
      setGradesReleased(false);
      setLoading(false);
      return;
    }

    setGrades(processedGrades);
    const subjects = Object.keys(processedGrades).map((subject) => ({
      label: subject,
      value: subject,
    }));
    setDropdownItems(subjects);
    setSelectedSubject(subjects[0]?.value || "");
  }, [data, processGrades]);

  const getChartData = useCallback((subjectGrades: Grade[]) => {
    const validGrades = subjectGrades.filter((grade) =>
      VALID_GRADES.has(grade.score),
    );
    const labels = validGrades.map((grade) =>
      grade.taskName
        .replace("Progress Grade", "P")
        .replace("Semester Grade", "S"),
    );
    const data = validGrades.map(
      (grade) => GRADE_SCORES[grade.score as keyof typeof GRADE_SCORES] ?? 0,
    );

    return {
      labels,
      datasets: [
        { data: data.length ? data : [0] },
        { data: [50], withDots: false },
        { data: [100], withDots: false },
      ],
    };
  }, []);

  const formatYLabel = useCallback((value: string) => {
    const numericValue = Number(value);
    return (
      Object.entries(GRADE_SCORES).find(
        ([_, score]) => numericValue >= score,
      )?.[0] ?? "F"
    );
  }, []);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await useLogin();
      await fetchGrades();
      setLoading(false);
    };
    initialize();
  }, [isLoading, fetchGrades]);

  useFocusEffect(
    useCallback(() => {
      fetchGrades();
    }, [fetchGrades]),
  );

  if (loading || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#BF1B1B" />
      </View>
    );
  }

  if (!gradesReleased) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ fontSize: 20, textAlign: "center" }}>
          Your grades haven't been posted yet!
        </Text>
        <Text style={{ fontSize: 20, textAlign: "center" }}>
          Check back after the first grading period
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Dropdown
        data={dropdownItems}
        labelField="label"
        valueField="value"
        placeholder="Select subject"
        value={selectedSubject}
        onChange={(item) => setSelectedSubject(item.value)}
        style={styles.dropdown}
        placeholderStyle={styles.dropdownText}
        selectedTextStyle={styles.dropdownText}
      />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {selectedSubject && grades[selectedSubject] && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.subjectTitle}>{selectedSubject}</Text>
            <LineChart
              data={getChartData(grades[selectedSubject])}
              width={chartWidth}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: "#1cc910",
                backgroundGradientFrom: "#eff3ff",
                backgroundGradientTo: "#efefef",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#ffa726",
                },
              }}
              bezier
              formatYLabel={formatYLabel}
              style={styles.chart}
            />
            <DataTable style={styles.dataTable}>
              <DataTable.Header style={styles.dataTableHeader}>
                <DataTable.Title>Task</DataTable.Title>
                <DataTable.Title numeric>Score</DataTable.Title>
              </DataTable.Header>
              {grades[selectedSubject]
                .filter((grade) => VALID_GRADES.has(grade.score))
                .map((grade) => (
                  <DataTable.Row key={grade.taskName}>
                    <DataTable.Cell>{grade.taskName}</DataTable.Cell>
                    <DataTable.Cell numeric>{grade.score}</DataTable.Cell>
                  </DataTable.Row>
                ))}
            </DataTable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
