import React from 'react';

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


            const response = await fetch(`https://fuhsd.infinitecampus.org/campus/resources/portal/roster?_expand=%7BsectionPlacements-%7Bterm%7D%7D&_date=${date}`, {
              method: 'GET',
              credentials: 'include'
            });

            let data = await response.json();
            let calendarID = data[0]['calendarID']
            console.log(calendarID);

            const responseDay = await fetch(`https://fuhsd.infinitecampus.org/campus/resources/calendar/instructionalDay?calendarID=${calendarID}&date=${date}`, {
                method: 'GET',
                credentials: 'include'
            });

            let dataForDay = await responseDay.json();
            let todayPeriodScheduleID = dataForDay[0]['periodScheduleID']
            console.log(todayPeriodScheduleID);

            // do a foreach for the data
            for (let i = 0; i < data.length; i++) {
                for (let j = 0; j < data[i]['sectionPlacements'].length; j++) {
                    let periodScheduleID = data[i]['sectionPlacements'][j]['periodScheduleID'];
                    if (periodScheduleID === todayPeriodScheduleID) {
                        console.log(data[i]['sectionPlacements'][j]['periodName']);
                }
            }
        }
        
            return Promise.resolve();
          } catch (err) {
            return Promise.reject(err);
          }
    }

}

