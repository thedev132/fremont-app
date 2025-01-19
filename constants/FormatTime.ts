export default function formatTime(timeString) {
  // Create a Date object with an arbitrary date to parse the time

  if (timeString == undefined) {
    return;
  }

  let time = new Date("2000-01-01T" + timeString);

  // Extract hours and minutes
  let hours = time.getHours();
  let minutes = time.getMinutes();

  // Determine if it's AM or PM
  let period = hours >= 12 ? "pm" : "am";

  // Convert hours from 24-hour to 12-hour format
  hours = hours % 12;
  hours = hours ? hours : 12; // Handle midnight case (0 hours)

  // Format minutes with leading zero if necessary
  minutes = minutes < 10 ? "0" + minutes : minutes;

  // Construct the formatted time string
  let formattedTime = hours + ":" + minutes + period;

  return formattedTime;
}
