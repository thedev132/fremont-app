export default function getGraduationYear(grade: Number) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // If the current month is August (7) or later, the school year is considered the current year
  const currentSchoolYear = currentMonth >= 7 ? currentYear : currentYear - 1;

  // Calculate graduation year
  const yearsUntilGraduation = 12 - grade;
  const graduationYear = currentSchoolYear + yearsUntilGraduation + 1;

  return graduationYear;
}
