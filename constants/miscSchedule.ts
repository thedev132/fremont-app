import Course from "@/hooks/InfiniteCampus/InfiniteCampusCourse";

const brunchSchedule = {
    "M1tut7": new Course("Brunch", undefined, undefined, undefined, "11:25", "11:40", "M1tut7"),
    "T1237": new Course("Brunch", undefined, undefined, undefined, "11:35", "11:50", "T1237"),
    "W4tut56": new Course("Brunch", undefined, undefined, undefined, "10:50", "11:05", "W4tut56"),
    "TH1237": new Course("Brunch", undefined, undefined, undefined, "11:35", "11:50", "T1237"),
    "F4tut56": new Course("Brunch", undefined, undefined, undefined, "10:50", "11:05", "F6tut8"),
};

const lunchSchedule = {
    "M1tut7": new Course("Lunch", undefined, undefined, undefined, "1:25", "2:05", "M1tut7"),
    "T1237": new Course("Lunch", undefined, undefined, undefined, "1:30", "2:10", "T1237"),
    "W4tut56": new Course("Lunch", undefined, undefined, undefined, "12:45", "1:25", "W4tut56"),
    "TH1237": new Course("Lunch", undefined, undefined, undefined, "1:30", "2:10", "T1237"),
    "F4tut56": new Course("Lunch", undefined, undefined, undefined, "12:45", "1:25", "F6tut8"),
};

export { brunchSchedule, lunchSchedule };