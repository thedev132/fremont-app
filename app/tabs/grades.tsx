import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import makeUser from '@/hooks/InfiniteCampus/MakeUser';
import { DataTable } from 'react-native-paper';
import { Dropdown } from 'react-native-element-dropdown';

interface Grade {
  taskName: string;
  score: string;
}

interface Grades {
  [subject: string]: Grade[];
}

export default function GradesScreen() {
  const [grades, setGrades] = useState<Grades>({});
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [dropdownItems, setDropdownItems] = useState<Array<{ label: string; value: string }>>([]);
  const [gradesReleased, setGradesReleased] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const fetchGrades = async () => {
      let user = await makeUser();
      let grades = await user.getGrades();
      if (grades == 'No grades') {
        setLoading(false);
        setGradesReleased(false);
        return;
      }

      // Update the task names with "Semester Grade 1", "Semester Grade 2", etc.
      Object.keys(grades).forEach(subject => {
        let semesterGradeCount = 1;
        grades[subject] = grades[subject].map(grade => {
          if (grade.taskName.startsWith('Semester Grade')) {
            grade.taskName = `Semester Grade ${semesterGradeCount}`;
            semesterGradeCount++;
          }
          return grade;
        });
      });

      // Filter out subjects containing "Team"
      const filteredGrades = Object.fromEntries(
        Object.entries(grades).filter(([subject]) => !subject.includes('Team'))
      );

      // Set the filtered grades and dropdown items
      setGrades(filteredGrades);
      const subjects = Object.keys(filteredGrades).map(subject => ({ label: subject, value: subject }));
      setDropdownItems(subjects);
      setSelectedSubject(subjects[0]?.value || ''); // Set the default selected subject if available
    };
    fetchGrades();
    setLoading(false);
  }, []);

  const screenWidth = Dimensions.get('window').width;

  const getChartData = (subjectGrades: Grade[]) => {
    const labels: string[] = [];
    const data: number[] = [];

    subjectGrades.forEach(grade => {
      let score: number | null = null;
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

  const formatYLabel = (value: number) => {
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

  if (!gradesReleased) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{ fontSize: 20, textAlign: 'center' }}>Your grades haven't been posted yet!</Text>
        <Text style={{ fontSize: 20, textAlign: 'center' }}>Check back after the first grading period</Text>
      </View>
    );
  }
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' color='#BF1B1B' />
      </View>
    );
  }
  return (
    <ScrollView>
      <View style={{ flex: 1, padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}></Text>
        <Dropdown
          data={dropdownItems}
          labelField="label"
          valueField="value"
          placeholder="Select subject"
          value={selectedSubject}
          onChange={(item) => {
            setSelectedSubject(item.value);
          }}
          style={{
            marginVertical: 20,
            height: 50,
            backgroundColor: '#fafafa',
            borderRadius: 8,
            padding: 12,
            borderWidth: 1,
            borderColor: '#ccc',
          }}
          placeholderStyle={{
            fontSize: 16,
            color: '#333',
          }}
          selectedTextStyle={{
            fontSize: 16,
            color: '#333',
          }}
        />
        {selectedSubject && grades[selectedSubject] && (
          <View style={{ marginVertical: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>{selectedSubject}</Text>
            <LineChart
              data={getChartData(grades[selectedSubject])}
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
              style={{ marginVertical: 8, borderRadius: 16 }}
            />
            <DataTable style={{ marginTop: 16 }}>
              <DataTable.Header>
                <DataTable.Title>Task</DataTable.Title>
                <DataTable.Title numeric>Score</DataTable.Title>
              </DataTable.Header>
              {grades[selectedSubject].map((grade) => {
                let score: number | null = null;
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
                // Only return rows with valid scores
                return score !== null ? (
                  <DataTable.Row key={grade.taskName}>
                    <DataTable.Cell>{grade.taskName}</DataTable.Cell>
                    <DataTable.Cell numeric>{grade.score}</DataTable.Cell>
                  </DataTable.Row>
                ) : null;
              })}
            </DataTable>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
