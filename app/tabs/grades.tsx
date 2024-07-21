import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, Dimensions, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import makeUser from '@/hooks/InfiniteCampus/MakeUser';
import { DataTable } from 'react-native-paper';

export default function GradesScreen() {
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    const fetchGrades = async () => {
      let user = await makeUser();
      let grades = await user.getGrades();
      setGrades(grades);
    };
    fetchGrades();
  }, []);

  const screenWidth = Dimensions.get('window').width;

  const getChartData = (subjectGrades) => {
    const labels = [];
    const data = [];
    
    subjectGrades.forEach(grade => {
      let score = null;
      switch (grade.score) {
        case 'A+':
          score = 97;
          break;
        case 'A':
          score = 93;
          break;
        case 'A-':
          score = 90;
          break;
        case 'B+':
          score = 87;
          break;
        case 'B':
          score = 83;
          break;
        case 'B-':
          score = 80;
          break;
        case 'C+':
          score = 77;
          break;
        case 'C':
          score = 73;
          break;
        case 'C-':
          score = 70;
          break;
        case 'D+':
          score = 67;
          break;
        case 'D':
          score = 63;
          break;
        case 'D-':
          score = 60;
          break;
        case 'F':
          score = 50;
          break;
        default:
          score = null; // Ignore other letters, including 'P'
          break;
      }

      if (score !== null) {
        labels.push(grade.taskName.replace('Progress Grade', 'P').replace('Semester Grade', 'S'));
        data.push(score);
      }
    });

    return {
      labels: labels,
      datasets: [
        { data: data.length ? data : [0] }, // Actual grades data
        { data: [50], withDots: false }, // Min value
        { data: [100], withDots: false } // Max value
      ],
      
    };
  };

  const formatYLabel = (value) => {
    if (value >= 97) return 'A+';
    if (value >= 93) return 'A';
    if (value >= 90) return 'A-';
    if (value >= 87) return 'B+';
    if (value >= 83) return 'B';
    if (value >= 80) return 'B-';
    if (value >= 77) return 'C+';
    if (value >= 73) return 'C';
    if (value >= 70) return 'C-';
    if (value >= 67) return 'D+';
    if (value >= 63) return 'D';
    if (value >= 60) return 'D-';
    return 'F';
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Grades</Text>
        {Object.keys(grades).map(subject => (
          <View key={subject} style={styles.chartContainer}>
            <Text style={styles.subjectTitle}>{subject}</Text>
            <LineChart
              data={getChartData(grades[subject])}
              width={screenWidth}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: '#1cc910',
                backgroundGradientFrom: '#eff3ff',
                backgroundGradientTo: '#efefef',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#ffa726'
                }
              }}
              bezier
              formatYLabel={formatYLabel}
              style={styles.chart}
            />
                        <DataTable style={{ marginTop: 16 }}>
              <DataTable.Header>
                <DataTable.Title>Task</DataTable.Title>
                <DataTable.Title numeric>Score</DataTable.Title>
              </DataTable.Header>
              {grades[subject].map((grade) => {
                let score = null;
                switch (grade.score) {
                  case 'A+':
                    score = 97;
                    break;
                  case 'A':
                    score = 93;
                    break;
                  case 'A-':
                    score = 90;
                    break;
                  case 'B+':
                    score = 87;
                    break;
                  case 'B':
                    score = 83;
                    break;
                  case 'B-':
                    score = 80;
                    break;
                  case 'C+':
                    score = 77;
                    break;
                  case 'C':
                    score = 73;
                    break;
                  case 'C-':
                    score = 70;
                    break;
                  case 'D+':
                    score = 67;
                    break;
                  case 'D':
                    score = 63;
                    break;
                  case 'D-':
                    score = 60;
                    break;
                  case 'F':
                    score = 50;
                    break;
                  default:
                    score = null; // Ignore other letters
                    break;
                }
                return score !== null ? (
                  <DataTable.Row key={grade.taskName}>
                    <DataTable.Cell>{grade.taskName}</DataTable.Cell>
                    <DataTable.Cell numeric>{score}</DataTable.Cell>
                  </DataTable.Row>
                ) : null;
              })}
            </DataTable>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chartContainer: {
    marginVertical: 20,
  },
  subjectTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  }
});
