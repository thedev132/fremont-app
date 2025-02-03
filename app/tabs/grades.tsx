import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ScrollView,
  Text,
  View,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { DataTable } from "react-native-paper";
import { Dropdown } from "react-native-element-dropdown";
import { useGrades, useLogin } from "@/hooks/InfiniteCampus/InfiniteCampus";
import useSWR from "swr";
import React from "react";
import { useFocusEffect } from "expo-router";
import Icon from "@expo/vector-icons/MaterialIcons";

interface Grade {
  taskName: string;
  score: string;
}

interface Grades {
  [subject: string]: Grade[];
}

interface GradeStats {
  highest: string;
  lowest: string;
  trend: 'up' | 'down' | 'stable';
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

const LoadingSpinner = React.memo(() => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#BF1B1B" />
  </View>
));

const NoGradesView = React.memo(() => (
  <View style={styles.loadingContainer}>
    <Icon name="grade" size={50} color="#BF1B1B" style={styles.noGradesIcon} />
    <Text style={styles.noGradesText}>
      Your grades haven't been posted yet!
    </Text>
    <Text style={styles.noGradesSubtext}>
      Check back after the first grading period
    </Text>
  </View>
));


const GradeStatsCard: React.FC<{ stats: GradeStats }> = React.memo(({ stats }) => (
  <View style={styles.statsContainer}>
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>Highest</Text>
      <Text style={styles.statValue}>{stats.highest}</Text>
    </View>
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>Lowest</Text>
      <Text style={styles.statValue}>{stats.lowest}</Text>
    </View>
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>Trend</Text>
      <Icon 
        name={stats.trend === 'up' ? 'trending-up' : stats.trend === 'down' ? 'trending-down' : 'trending-flat'} 
        size={24} 
        color={stats.trend === 'up' ? '#4CAF50' : stats.trend === 'down' ? '#F44336' : '#9E9E9E'}
      />
    </View>
  </View>
));

const GradeChart: React.FC<{
  data: any;
  width: number;
  formatYLabel: (value: string) => string;
  yAxisMin: number;
  yAxisMax: number;
}> = React.memo(({ data, width, formatYLabel, yAxisMin, yAxisMax }) => (
  <LineChart
    data={data}
    width={width}
    height={220}
    fromZero={false}
    yAxisLabel=""
    yAxisSuffix=""
    chartConfig={{
      backgroundColor: "#ffffff",
      backgroundGradientFrom: "#ffffff",
      backgroundGradientTo: "#ffffff",
      decimalPlaces: 0,
      color: (opacity = 1) => `rgba(191, 27, 27, ${opacity})`,
      labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
      style: { borderRadius: 16 },
      propsForDots: {
        r: "6",
        strokeWidth: "2",
        stroke: "#BF1B1B",
      },
      propsForBackgroundLines: {
        strokeDasharray: '5,5',
        strokeWidth: 1,
      },
      propsForVerticalLabels: {
        dx: -5
      },
    }}
    bezier
    formatYLabel={formatYLabel}
    style={styles.chart}
    withInnerLines={true}
    withOuterLines={true}
    withShadow={false}
    segments={5}
    yAxisInterval={1}
    xLabelsOffset={-10}
    verticalLabelRotation={-45}
    // Custom axis scaling
    getYValues={values => values.map(v => Math.max(yAxisMin, Math.min(yAxisMax, v)))}
  />
));

export default function GradesScreen() {
  const [grades, setGrades] = useState<Grades>({});
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [dropdownItems, setDropdownItems] = useState<Array<{ label: string; value: string }>>([]);
  const [gradesReleased, setGradesReleased] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const screenWidth = useMemo(() => Dimensions.get("window").width, []);
  const chartWidth = useMemo(() => Math.min(screenWidth - 64, 768), [screenWidth]);

  const { data: gradesData, mutate: reloadGrades } = useSWR(
    "https://fuhsd.infinitecampus.org/campus/resources/portal/grades/"
  );

  const calculateGradeStats = useCallback((grades: Grade[]): GradeStats => {
    const validGrades = grades
      .filter(grade => VALID_GRADES.has(grade.score))
      .map(grade => ({
        ...grade,
        numeric: GRADE_SCORES[grade.score as keyof typeof GRADE_SCORES] ?? 0
      }));
  
    if (validGrades.length === 0) {
      return { highest: 'N/A', lowest: 'N/A', trend: 'stable' };
    }
  
    const numericValues = validGrades.map(g => g.numeric);
    const highestGrade = validGrades.reduce((a, b) => a.numeric > b.numeric ? a : b);
    const lowestGrade = validGrades.reduce((a, b) => a.numeric < b.numeric ? a : b);
  
    // Trend based on natural order (assumes grades are in chronological order)
    let trend: GradeStats['trend'] = 'stable';
    if (validGrades.length >= 2) {
      const last = numericValues[numericValues.length - 1];
      const secondLast = numericValues[numericValues.length - 2];
      trend = last > secondLast ? 'up' : last < secondLast ? 'down' : 'stable';
    }
  
    return {
      highest: highestGrade.score,
      lowest: lowestGrade.score,
      trend
    };
  }, []);  

  const processGrades = useCallback((rawGrades: any) => {
    if (rawGrades === "No grades") return null;
  
    return Object.entries(rawGrades)
      .filter(([subject]) => !subject.includes("Team"))
      .reduce((acc, [subject, gradeList]) => {
        let semesterCount = 0;
        const processed = (gradeList as Grade[]).map((grade) => {
          if (grade.taskName.startsWith("Semester Grade")) {
            semesterCount += 1;
            return {
              ...grade,
              taskName: `Semester ${semesterCount}`
            };
          } else {
            return {
              ...grade,
              taskName: grade.taskName.replace("Progress Grade", "Progress")
            };
          }
        });
  
        return {
          ...acc,
          [subject]: processed
        };
      }, {} as Grades);
  }, []);


  const getChartData = useCallback((subjectGrades: Grade[]) => {
    const validGrades = subjectGrades
      .filter(grade => VALID_GRADES.has(grade.score))
      .map(grade => ({
        ...grade,
        numeric: GRADE_SCORES[grade.score as keyof typeof GRADE_SCORES] ?? 0
      }));
  
    // Calculate grade range for axis scaling
    const grades = validGrades.map(g => g.numeric);
    const minGrade = Math.min(...grades);
    const maxGrade = Math.max(...grades);
    
    // Adjust y-axis scale based on grade range
    const yAxisMin = minGrade > 90 ? 80 : Math.max(0, minGrade - 10);
    const yAxisMax = Math.min(100, maxGrade + 5);
  
    return {
      labels: validGrades.map(grade => {
        const match = grade.taskName.match(/(Progress|Semester)\s*(\d+)/i);
        return match ? `${match[1][0]}${match[2]}` : grade.taskName;
      }),
      datasets: [{
        data: validGrades.map(g => g.numeric),
        color: (opacity = 1) => `rgba(191, 27, 27, ${opacity})`,
        strokeWidth: 2,
      }],
      yAxisMin, // Custom property for our chart config
      yAxisMax
    };
  }, []);

  const formatYLabel = useCallback((value: string) => {
    const numericValue = Number(value);
    return Object.entries(GRADE_SCORES).find(
      ([_, score]) => numericValue >= score
    )?.[0] ?? "F";
  }, []);

  const [state, setState] = useState<{
    grades: Grades;
    loading: boolean;
    error: string | null;
    gradesReleased: boolean;
    selectedSubject: string;
  }>({
    grades: {},
    loading: true,
    error: null,
    gradesReleased: true,
    selectedSubject: "",
  });

  
  const fetchGrades = useCallback(async (isRefresh = false) => {
    try {
      setState(prev => ({
        ...prev,
        error: null,
        loading: !isRefresh,
        gradesReleased: true
      }));

      const rawGrades = await useGrades(gradesData);
      const processedGrades = processGrades(rawGrades);

      // Handle empty grades response
      if (processedGrades === null || Object.keys(processedGrades).length === 0) {
        return setState(prev => ({
          ...prev,
          gradesReleased: false,
          loading: false
        }));
      }

      // Update state with new grades
      setState(prev => ({
        ...prev,
        grades: processedGrades,
        loading: false,
        gradesReleased: true,
        selectedSubject: prev.selectedSubject || Object.keys(processedGrades)[0] || ""
      }));

    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : "Failed to load grades",
        loading: false,
        gradesReleased: prev.gradesReleased // Preserve previous state
      }));
    }
  }, [gradesData]);

  // Updated refresh handler
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setState(prev => ({ ...prev, error: null }));
      await reloadGrades();
      await fetchGrades(true);
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: "Failed to refresh grades",
        loading: false
      }));
    } finally {
      setRefreshing(false);
    }
  }, [reloadGrades, fetchGrades]);

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await useLogin();
      await fetchGrades();
    };
    initialize();
  }, [fetchGrades]);

  useEffect(() => {
    if (dropdownItems.length > 0 && !selectedSubject) {
      setSelectedSubject(dropdownItems[0].value);
    }
  }, [dropdownItems, selectedSubject]);

  useFocusEffect(
    useCallback(() => {
      fetchGrades();
    }, [fetchGrades])
  );

  useEffect(() => {
    if (Object.keys(state.grades).length > 0 && !state.selectedSubject) {
      const firstSubject = Object.keys(state.grades)[0];
      if (firstSubject) {
        setState(prev => ({
          ...prev,
          selectedSubject: firstSubject
        }));
      }
    }
  }, [state.grades, state.selectedSubject]);

  if (state.loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={50} color="#BF1B1B" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!state.gradesReleased) {
    return <NoGradesView />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {state.gradesReleased && Object.keys(state.grades).length > 0 && (
        <Dropdown
          data={Object.keys(state.grades).map(subject => ({
            label: subject,
            value: subject
          }))}
          labelField="label"
          valueField="value"
          placeholder="Select subject"
          value={state.selectedSubject}
          onChange={(item) => setState(prev => ({...prev, selectedSubject: item.value}))}
          style={styles.dropdown}
          placeholderStyle={styles.dropdownText}
          selectedTextStyle={styles.dropdownText}
        />
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={state.loading} 
            onRefresh={onRefresh} 
          />
        }
      >
        {state.loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#BF1B1B" />
          </View>
        ) : state.selectedSubject && state.grades[state.selectedSubject] ? (
          <View style={styles.contentContainer}>
            <Text style={styles.subjectTitle}>{state.selectedSubject}</Text>
            <GradeStatsCard stats={calculateGradeStats(state.grades[state.selectedSubject])} />
            <GradeChart
              data={getChartData(state.grades[state.selectedSubject])}
              width={chartWidth}
              formatYLabel={formatYLabel}
            />
            <DataTable style={styles.dataTable}>
              <DataTable.Header style={styles.dataTableHeader}>
                <DataTable.Title>Task</DataTable.Title>
                <DataTable.Title numeric>Score</DataTable.Title>
              </DataTable.Header>
              {state.grades[state.selectedSubject]
                ?.filter((grade) => VALID_GRADES.has(grade.score))
                ?.map((grade) => (
                  <DataTable.Row key={grade.taskName}>
                    <DataTable.Cell>{grade.taskName}</DataTable.Cell>
                    <DataTable.Cell numeric>{grade.score}</DataTable.Cell>
                  </DataTable.Row>
                ))}
            </DataTable>
          </View>
        ) : (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#BF1B1B" />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#BF1B1B",
    textAlign: "center",
    marginTop: 10,
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#BF1B1B",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  dropdown: {
    marginBottom: 10,
    marginTop: 40,
    height: 50,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dropdownText: {
    fontSize: 16,
    color: "#333333",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
    alignSelf: "center",
    width: "100%",
  },
  contentContainer: {
    marginBottom: 20,
  },
  subjectTitle: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
    color: "#333333",
  },
  chart: {
    marginVertical: 16,
    borderRadius: 16,
    alignSelf: "center",
    backgroundColor: "#ffffff",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  dataTable: {
    marginTop: 16,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dataTableHeader: {
    backgroundColor: "#f8f8f8",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
  },
  noGradesIcon: {
    marginBottom: 16,
  },
  noGradesText: {
    fontSize: 20,
    textAlign: "center",
    color: "#333333",
    marginBottom: 8,
  },
  noGradesSubtext: {
    fontSize: 16,
    textAlign: "center",
    color: "#666666",
  },
});