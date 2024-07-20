// import React, { useEffect, useState } from 'react';
// import { ScrollView, Text, View, Dimensions } from 'react-native';
// import { BarChart } from 'react-native-chart-kit';
// import makeUser from '@/hooks/InfiniteCampus/MakeUser';

// export default function GradesScreen() {
//   const [grades, setGrades] = useState([]);

//   useEffect(() => {
//     const fetchGrades = async () => {
//       let user = await makeUser();
//       let grades = await user.getGrades();
//       setGrades(grades);
//     };
//     fetchGrades();
//   }, []);

//   const screenWidth = Dimensions.get('window').width;

//   const getChartData = (subjectGrades) => {
//     const labels = [];
//     const data = [];

//     subjectGrades.forEach(grade => {
//       let score = null;
//       switch (grade.score) {
//         case 'A+':
//         case 'A':
//         case 'A-':
//           score = 95;
//           break;
//         case 'B+':
//         case 'B':
//         case 'B-':
//           score = 85;
//           break;
//         case 'C+':
//         case 'C':
//         case 'C-':
//           score = 75;
//           break;
//         case 'D+':
//         case 'D':
//         case 'D-':
//           score = 65;
//           break;
//         case 'F':
//           score = 50;
//           break;
//         default:
//           score = null; // Ignore other letters, including 'P'
//           break;
//       }

//       if (score !== null) {
//         labels.push(grade.taskName.replace('Progress Grade', 'P').replace('Semester Grade', 'S'));
//         data.push(score);
//       }
//     });

//     return {
//       labels: labels,
//       datasets: [{ data: data.length ? data : [0] }] // Ensure data is not empty
//     };
//   };

//   const yLabels = ['F', 'D', 'C', 'B', 'A'];

//   return (
//     <ScrollView>
//       <View>
//         <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center' }}>Grades</Text>
//         {Object.keys(grades).map(subject => (
//           <View key={subject} style={{ marginVertical: 20, flexDirection: 'row', alignItems: 'center' }}>
//             <View style={{ width: 30, alignItems: 'center' }}>
//               {yLabels.map((label, index) => (
//                 <Text key={index} style={{ fontSize: 12, height: 44 }}>{label}</Text>
//               ))}
//             </View>
//             <View style={{ flex: 1 }}>
//               <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center' }}>{subject}</Text>
//               <BarChart
//                 data={getChartData(grades[subject])}
//                 width={screenWidth - 50}
//                 height={220}
//                 yAxisLabel=""
//                 yAxisSuffix=""
//                 chartConfig={{
//                   backgroundColor: '#1cc910',
//                   backgroundGradientFrom: '#eff3ff',
//                   backgroundGradientTo: '#efefef',
//                   decimalPlaces: 0,
//                   color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//                   labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
//                   style: { borderRadius: 16 },
//                   propsForDots: {
//                     r: '6',
//                     strokeWidth: '2',
//                     stroke: '#ffa726'
//                   }
//                 }}
//                 fromZero={true}
//                 verticalLabelRotation={30}
//                 yAxisInterval={1}
//                 style={{ marginVertical: 8, borderRadius: 16 }}
//               />
//             </View>
//           </View>
//         ))}
//       </View>
//     </ScrollView>
//   );
// }
