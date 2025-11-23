/**
 * Generates a time-based title like "June 7 Evening" or "June 8 Morning"
 */
export function generateTimeBasedTitle(): string {
  const now = new Date();
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
  
  const month = months[now.getMonth()];
  const day = now.getDate();
  const hour = now.getHours();
  
  let timeOfDay: string;
  if (hour >= 5 && hour < 12) {
    timeOfDay = 'Morning';
  } else if (hour >= 12 && hour < 17) {
    timeOfDay = 'Afternoon';
  } else if (hour >= 17 && hour < 21) {
    timeOfDay = 'Evening';
  } else {
    timeOfDay = 'Night';
  }
  
  return `${month} ${day} ${timeOfDay}`;
}
