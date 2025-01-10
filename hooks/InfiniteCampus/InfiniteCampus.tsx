import CookieManager from '@react-native-cookies/cookies';
import { brunchSchedule, lunchSchedule, RallySchedule } from '@/constants/miscSchedule';
import Course from './InfiniteCampusCourse';
import Student from './InfiniteCampusStudent';
import makeUser from './MakeUser';

const fetcher = async (url: string, options: RequestInit = {}) => {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Error fetching data: ${res.statusText}`);
  }
  return res.json();
};

// Clear cookies and perform login
export const useLogin = async () => {
  const { email, password } = await makeUser();
  await CookieManager.clearAll();
  const response = await fetch("https://fuhsd.infinitecampus.org/campus/verify.jsp", {
    headers: {
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
      "content-type": "application/x-www-form-urlencoded",
    },
    referrer: "https://fuhsd.infinitecampus.org/campus/portal/students/fremont.jsp?status=logoff",
    body: `username=${email}&password=${password}&portalUrl=portal%2Fstudents%2Ffremont.jsp%3F%26rID%3D0.09995412410637872&appName=fremont&url=nav-wrapper&lang=en&portalLoginPage=students`,
    method: "POST",
    credentials: "include",
  });

  const checkLoggedIn = await fetch(`https://fuhsd.infinitecampus.org/campus/api/portal/students`, {
    method: "GET",
    credentials: "include",
  });

  return checkLoggedIn.ok ? "success" : "password";

};

// Fetch grades
export const useGrades = async (data) => {
  await useLogin();
  const gradesDict: Record<string, { taskName: string; score: string | null }[]> = {};
  let hasGrades = false;

  data[0]?.courses.forEach((course: any) => {
    const courseName = course.courseName;
    gradesDict[courseName] = [];

    course.gradingTasks.forEach((task: any) => {
      if (task.score) {
        hasGrades = true;
      }
      gradesDict[courseName].push({
        taskName: task.taskName,
        score: task.score,
      });
    });
  });

  return hasGrades ? gradesDict : "No grades";
};

// Fetch schedule
const isDateInRange = (start: string, end: string, current: string) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const currentDate = new Date(current);
  return currentDate >= startDate && currentDate <= endDate;
};

export const useSchedule = async (
  formattedDate: string,
  rosterData: any[],
  dayData: any[]
) => {
  await useLogin()
  let courses = new Array<Course>();
  const todayPeriodScheduleID = dayData[0]?.periodScheduleID;
  let todayPeriodScheduleName = null
  const isSchoolDay: boolean = dayData[0]?.isSchoolDay;
  let termName = null;
  console.log("isSchoolDay", isSchoolDay);

  // Process other classes
  for (let i = 0; i < rosterData.length; i++) {
    for (let j = 0; j < rosterData[i]['sectionPlacements'].length; j++) {
        let periodScheduleID = rosterData[i]['sectionPlacements'][j]['periodScheduleID'];
        let term = rosterData[i]['sectionPlacements'][j]['termName'];
        termName = term;  
        let startTerm = rosterData[i]['sectionPlacements'][j]['term']['startDate'];
        let endTerm = rosterData[i]['sectionPlacements'][j]['term']['endDate'];
        let isInTermRange = isDateInRange(startTerm, endTerm, formattedDate);

        // COMPARE END DATES TO CURRENT DATE TO DETERMINE THE CURRENT TERM
        if (periodScheduleID === todayPeriodScheduleID && isInTermRange) {
            todayPeriodScheduleName = rosterData[i]['sectionPlacements'][j]['periodScheduleName'];
            courses.push(new Course(
              rosterData[i]['courseName'],
              rosterData[i]['sectionPlacements'][j]['teacherDisplay'],
              rosterData[i]['roomName'],
              rosterData[i]['sectionPlacements'][j]['periodName'],
              rosterData[i]['sectionPlacements'][j]['startTime'],
              rosterData[i]['sectionPlacements'][j]['endTime'],
              rosterData[i]['sectionPlacements'][j]['periodScheduleName']
            ));
        }
    }
  }

  // Add brunch, lunch, and misc to the schedule based on today's period schedule name
  if (brunchSchedule[todayPeriodScheduleName]) {
      courses.push(brunchSchedule[todayPeriodScheduleName]);
  }
  if (lunchSchedule[todayPeriodScheduleName]) {
      courses.push(lunchSchedule[todayPeriodScheduleName]);
  }

  if (RallySchedule[todayPeriodScheduleName]) {
      courses.push(RallySchedule[todayPeriodScheduleName]);
  }



  return {
    data: isSchoolDay == true ? (courses.length > 0 ? courses : 'No courses') : 'No school today',
    loading: false,
    error: null,
    term: termName,
  };
};

// Fetch student info
export const useStudentInfo = async (data) => {

  await useLogin();
  const studentData = data[0];
  console.log('studentData', studentData);
  const firstName = studentData?.firstName || undefined;
  const lastName = studentData?.lastName || undefined;
  const grade = studentData?.enrollments[0]?.grade || undefined;
  const studentID = studentData?.studentNumber || undefined;

  const student = new Student(firstName, lastName, grade, studentID);

  return { student, loading: false, error: null };
};

// Fetch entire schedule
export const useEntireSchedule = (data: any[]) => {
  const classes = data.map((course: any) => {

    const courseName = course.courseName || undefined;
    const teacher = course.teacherDisplay || undefined;
    const room = course.roomName || undefined;
    const period = course.sectionPlacements?.[0]?.periodName || undefined;
    const startTime = course.sectionPlacements?.[0]?.startTime || '00:00';
    const endTime = course.sectionPlacements?.[0]?.endTime || '00:00';
    const scheduleName = course.sectionPlacements?.[0]?.periodScheduleName || undefined;

    return new Course(courseName, teacher, room, period, startTime, endTime, scheduleName);
  });

  return classes; 
};
