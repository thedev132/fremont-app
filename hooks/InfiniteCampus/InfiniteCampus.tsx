import React from 'react';
import Course
 from './InfiniteCampusCourse';

import Student from '@/hooks/InfiniteCampus/InfiniteCampusStudent';
import { brunchSchedule, lunchSchedule, RallySchedule } from '@/constants/miscSchedule';
import { createIconSet } from '@expo/vector-icons';
import { isDateInRange } from '@/constants/utils';

export default class InfiniteCampus {
    public name: string | undefined;
    public password: string | undefined;

    constructor(name: string, password: string) {

        this.name = name;
        this.password = password;

    }

    public async login() {
          try {
            const response = await fetch("https://fuhsd.infinitecampus.org/campus/verify.jsp", {
              "headers": {
                "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "en-US,en;q=0.9",
              },
              "referrer": "https://fuhsd.infinitecampus.org/campus/portal/students/fremont.jsp?status=login",
              "referrerPolicy": "strict-origin-when-cross-origin",
              "body": `nonBrowser=true&username=${this.name}&password=${this.password}&appName=fremont`,
              "method": "POST",
              "mode": "cors",
              "credentials": "include"
            });
            let check = await this.checkLoggedIn();
            if (!check) {
              return "password"
            }
            if (check) {
              return "success"
            }
            return Promise.resolve();
          } catch (err) {
            return Promise.reject(err);
          }
    }

    public async checkLoggedIn() {
      try {
        const response = await fetch(`https://fuhsd.infinitecampus.org/campus/api/portal/students`, {
          method: 'GET',
        });
        console.log(await response.json());
        if (response.ok) {
          return true;
        }
        return false;

      }
      catch (err) {
        return Promise.reject(err);
      }
    }


    public async getGrades() {
      try {
          const response = await fetch(`https://fuhsd.infinitecampus.org/campus/resources/portal/grades/`, {
              method: 'GET',
              credentials: 'include'
          });
  
          let data = await response.json();
          if (data.length === 0) {
              return "No grades";
          }
  
          let courses = data[0]['courses'];
          let gradesDict = {};
          let hasGrades = false;
  
          for (let course of courses) {
              let courseName = course['courseName'];
              gradesDict[courseName] = [];
              
              for (let gradingTask of course['gradingTasks']) {
                  if (gradingTask['score']) {
                      hasGrades = true;
                  }
                  gradesDict[courseName].push({
                      taskName: gradingTask['taskName'],
                      score: gradingTask['score']
                  });
              }
          }
  
          if (!hasGrades) {
              return "No grades";
          }
  
          return gradesDict;
      } catch (err) {
          return Promise.reject(err);
      }
  }
  


  public async getSchedule(date: Date | string) {
    try {
        let courses = new Array<Course>();
        const response = await fetch(`https://fuhsd.infinitecampus.org/campus/resources/portal/roster?_expand=%7BsectionPlacements-%7Bterm%7D%7D&_date=${date}`, {
            method: 'GET',
        });
        let data = await response.json();
        if (data.length == 0) {
            return "No courses";
        }
        let calendarID = data[0]['calendarID'];

        const responseDay = await fetch(`https://fuhsd.infinitecampus.org/campus/resources/calendar/instructionalDay?calendarID=${calendarID}&date=${date}`, {
            method: 'GET',
        });

        let dataForDay = await responseDay.json();
        if (dataForDay.length === 0) {
            return "No school today";
        }
        let todayPeriodScheduleID = dataForDay[0]['periodScheduleID'];
        let todayPeriodScheduleName = null


        // Process other classes
        for (let i = 0; i < data.length; i++) {
            for (let j = 0; j < data[i]['sectionPlacements'].length; j++) {
                let periodScheduleID = data[i]['sectionPlacements'][j]['periodScheduleID'];
                let term = data[i]['sectionPlacements'][j]['termName'];
                let startTerm = data[i]['sectionPlacements'][j]['term']['startDate'];
                let endTerm = data[i]['sectionPlacements'][j]['term']['endDate'];
                let currentDate = date.toString();
                let isInTermRange = isDateInRange(startTerm, endTerm, currentDate);

                // COMPARE END DATES TO CURRENT DATE TO DETERMINE THE CURRENT TERM
                if (periodScheduleID === todayPeriodScheduleID && isInTermRange) {
                    todayPeriodScheduleName = data[i]['sectionPlacements'][j]['periodScheduleName'];
                    courses.push(new Course(
                        data[i]['courseName'],
                        data[i]['sectionPlacements'][j]['teacherDisplay'],
                        data[i]['roomName'],
                        data[i]['sectionPlacements'][j]['periodName'],
                        data[i]['sectionPlacements'][j]['startTime'],
                        data[i]['sectionPlacements'][j]['endTime'],
                        data[i]['sectionPlacements'][j]['periodScheduleName']
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

        return courses;


    } catch (error) {
        console.error("Error fetching schedule:", error);
        return "Error fetching schedule";
    }
}


    public async getIDNumber() {
      try {
          const response = await fetch(`https://fuhsd.infinitecampus.org/campus/api/portal/students`, {
            method: 'GET',
          });

          let data = await response.json();
          let IDNumber =  data[0]['studentNumber'];
          return IDNumber;

        } catch (err) {
          return Promise.reject(err);
        }
    }

    public async getStudentInfo() {
      try {
          const response = await fetch(`https://fuhsd.infinitecampus.org/campus/api/portal/students`, {
            method: 'GET',
          });
          let data = await response.json();
          let studentID = data[0]['studentNumber'] ?? '';
          if (studentID == '') {
            return "No ID";
          }
          let personID =  data[0]['personID'] ?? '';
          let profilePicture = await this.getProfilePicture(personID) ?? ''
          let firstName = data[0]['firstName'];
          let lastName = data[0]['lastName'];
          let grade = data[0]['enrollments'][0]['grade'] ?? '';
          let student = new Student(firstName, lastName, grade, studentID, profilePicture);
          return student;

        } catch (err) {
          console.log('error');
          return Promise.reject(err);
      }
    }

    public async getProfilePicture(personID: string) {
      try {
          const response = await fetch(`https://fuhsd.infinitecampus.org/campus/personPicture.jsp?personID=${personID}&alt=teacherApp&img=large`, {
            method: 'GET',
          });
          let blob = await response.blob();
          const fileReaderInstance = new FileReader();

          return new Promise((resolve, reject) => {
              // Start reading the blob as a data URL
              fileReaderInstance.readAsDataURL(blob);
  
              // On successful load, resolve the promise with the base64 data
              fileReaderInstance.onload = () => {
                  let base64data = fileReaderInstance.result as string;
                  resolve(base64data);
              };
  
              // On error, reject the promise
              fileReaderInstance.onerror = (error) => {
                  reject(error);
              };
            });
          
        } catch (err) {
          console.log('error');
          return Promise.reject(err);
        }
    }

    public async getEntireSchedule() {
      const response = await fetch("https://fuhsd.infinitecampus.org/campus/resources/portal/roster?_expand=%7BsectionPlacements-%7Bterm%7D%7D&_crossSite=true", {
        "headers": {
            "Accept": "application/json"
        },
        "method": "GET",
      })
      let data = await response.json()
      let classes: Course[] = []
      for (let course in data) {
        classes.push(new Course(data[course]['courseName'], data[course]["teacherDisplay"], data[course]["roomName"], data[course]["sectionPlacements"][0]["periodName"], null, null,  data[course]["sectionPlacements"][0]['periodScheduleName']))
      }
      return classes

    }

}

