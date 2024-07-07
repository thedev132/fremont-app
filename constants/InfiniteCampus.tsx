import React from 'react';
import Course
 from './InfiniteCampusCourse';

import Student from './InfiniteCampusStudent';

export default class InfiniteCampus {
    public name: string | undefined;
    public password: string | undefined;

    constructor(name: string, password: string) {

        this.name = name;
        this.password = password;

    }

    public async login() {
          try {
            const response = await fetch(`https://fuhsd.infinitecampus.org/campus/verify.jsp?nonBrowser=true&username=${this.name}&password=${this.password}&appName=fremont`, {
              method: 'GET',
              credentials: 'include'
            });
        
            return Promise.resolve();
          } catch (err) {
            return Promise.reject(err);
          }
    }

    // WORK IN PROGRESS
    // public async getGrades() {
    //     try {
    //         const response = await fetch(`https://fuhsd.infinitecampus.org/campus/resources/portal/grades`, {
    //           method: 'GET',
    //           credentials: 'include'
    //         });

    //         let data = await response.json();
    //         console.log(data);
        
    //         return Promise.resolve();
    //       } catch (err) {
    //         return Promise.reject(err);
    //       }
    // }
    // https://fuhsd.infinitecampus.org/campus/resources/calendar/instructionalDay?calendarID=640


    public async getSchedule(date: Date | string) {
        
        try {
            let courses = new Array<Course>();
            const response = await fetch(`https://fuhsd.infinitecampus.org/campus/resources/portal/roster?_expand=%7BsectionPlacements-%7Bterm%7D%7D&_date=${date}`, {
              method: 'GET',
            });
            let data = await response.json();
            let calendarID = data[0]['calendarID']

            const responseDay = await fetch(`https://fuhsd.infinitecampus.org/campus/resources/calendar/instructionalDay?calendarID=${calendarID}&date=${date}`, {
                method: 'GET',
            });

            let dataForDay = await responseDay.json();
            let todayPeriodScheduleID = dataForDay[0]['periodScheduleID']

            // do a foreach for the data
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < data[i]['sectionPlacements'].length; j++) {
                    let periodScheduleID = data[i]['sectionPlacements'][j]['periodScheduleID'];
                    let term = data[i]['sectionPlacements'][j]['termName'];

                    // COMPARE END DATES TO CURRENT DATE TO DETERMINE THE CURRENT TERM

                    if (periodScheduleID === todayPeriodScheduleID) {
                        courses.push(new Course(data[i]['courseName'], data[i]['sectionPlacements'][j]['teacherDisplay'], data[i]['roomName'], data[i]['sectionPlacements'][j]['periodName'], data[i]['sectionPlacements'][j]['startTime'], data[i]['sectionPlacements'][j]['endTime'], data[i]['sectionPlacements'][j]['periodScheduleName']));
                }
            }
        }

            return courses;
          } catch (err) {
            console.log('error2');
            return Promise.reject(err);
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
          let personID =  data[0]['personID'];
          let profilePicture = await this.getProfilePicture(personID) ?? ''
          let studentID = data[0]['studentNumber'];
          let firstName = data[0]['firstName'];

          let lastName = data[0]['lastName'];
          let grade = data[0]['enrollments'][0]['grade'];
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

}