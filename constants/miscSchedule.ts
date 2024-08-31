import Course from "@/hooks/InfiniteCampus/InfiniteCampusCourse";

const brunchSchedule = {
    "M1tut7": new Course("Brunch", undefined, undefined, undefined, "11:25:00", "11:40:00", "M1tut7"),
    "T1237": new Course("Brunch", undefined, undefined, undefined, "11:35:00", "11:50:00", "T1237"),
    "W4tut56": new Course("Brunch", undefined, undefined, undefined, "10:50:00", "11:05:00", "W4tut56"),
    "W4adv56": new Course("Brunch", undefined, undefined, undefined, "10:50:00", "11:05:00", "W4adv56"),
    "Th1237": new Course("Brunch", undefined, undefined, undefined, "11:35:00", "11:50:00", "Th1237"),
    "F4tut56": new Course("Brunch", undefined, undefined, undefined, "10:50:00", "11:05:00", "F4tut56"),
    "Rly456": new Course("Brunch", undefined, undefined, undefined, "10:50:00", "11:05:00", "Rly456"),
};

const lunchSchedule = {
    "M1tut7": new Course("Lunch", undefined, undefined, undefined, "13:25:00", "14:05:00", "M1tut7"),
    "T1237": new Course("Lunch", undefined, undefined, undefined, "13:30:00", "14:10:00", "T1237"),
    "W4tut56": new Course("Lunch", undefined, undefined, undefined, "12:45:00", "13:25:00", "W4tut56"),
    "W4adv56": new Course("Lunch", undefined, undefined, undefined, "12:45:00", "13:25:00", "W4adv56"),
    "Th1237": new Course("Lunch", undefined, undefined, undefined, "13:30:00", "14:10:00", "Th1237"),
    "F4tut56": new Course("Lunch", undefined, undefined, undefined, "12:45:00", "13:25:00", "F4tut56"),
    "Rly456": new Course("Lunch", undefined, undefined, undefined, "12:45:00", "13:25:00", "Rly456"),
};

const RallySchedule = {
    "Rly456": new Course("Rally", undefined, "Gym", undefined, "10:10:00", "10:50:00", "Rly456"),
};

export { brunchSchedule, lunchSchedule, RallySchedule };