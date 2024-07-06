import React from 'react';
import Course
 from './InfiniteCampusCourse';
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

    public async getPersonID() {
      try {
          const response = await fetch(`https://fuhsd.infinitecampus.org/campus/api/portal/students`, {
            method: 'GET',
          });

          let data = await response.json();
          let studentID =  data[0]['personID'];
          return studentID;

        } catch (err) {
          return Promise.reject(err);
      }
    }

    public async getProfilePicture() {
      //https://fuhsd.infinitecampus.org/campus/personPicture.jsp?personID=231994&alt=teacherApp&img=large
      try {
          const response = await fetch(`https://fuhsd.infinitecampus.org/campus/personPicture.jsp?personID=${await this.getPersonID()}&alt=teacherApp&img=large`, {
            method: 'GET',
          });
          let blob = await response.blob();
          const fileReaderInstance = new FileReader();
          fileReaderInstance.readAsDataURL(blob); 
          fileReaderInstance.onload = () => {
              let base64data = fileReaderInstance.result;                
              console.log(base64data);
 }
          
        } catch (err) {
          return Promise.reject(err);
        }
    }

}