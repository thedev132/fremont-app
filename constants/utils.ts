export function stripAfterAtSymbol(inputString) {
  return inputString.split("@")[0];
}

export function isDateInRange(
  startDate: string,
  endDate: string,
  checkDate: string,
) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const check = new Date(checkDate);

  return check >= start && check <= end;
}

export const isWeekend = () => {
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const today = new Date();

  const localDate = new Date(
    today.toLocaleString("en-US", { timeZone: userTimezone }),
  );
  const day = localDate.getDay();

  return day === 0 || day === 6;
};
