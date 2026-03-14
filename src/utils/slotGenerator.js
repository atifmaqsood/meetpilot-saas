import { 
  addMinutes, 
  format, 
  isBefore, 
  parse, 
  startOfDay, 
  endOfDay, 
  eachMinuteOfInterval,
  isWithinInterval,
  addDays,
  getDay
} from 'date-fns';

/**
 * Generates available time slots for a specific date.
 * @param {Date} date - The date to check
 * @param {Object} availability - User's availability settings
 * @param {Number} duration - Meeting duration in minutes
 * @param {Array} existingBookings - Array of existing bookings for the user
 */
export const generateAvailableSlots = (date, availability, duration, existingBookings) => {
  const dayOfWeek = getDay(date); // 0 (Sun) to 6 (Sat)
  
  // Check if working day
  if (!availability.workingDays.includes(dayOfWeek)) {
    return [];
  }

  const { start, end } = availability.workingHours;
  const startTime = parse(start, 'HH:mm', date);
  const endTime = parse(end, 'HH:mm', date);
  
  const slots = [];
  let currentSlot = startTime;

  while (isBefore(addMinutes(currentSlot, duration), endTime) || format(addMinutes(currentSlot, duration), 'HH:mm') === format(endTime, 'HH:mm')) {
    const slotEnd = addMinutes(currentSlot, duration);
    
    // Check if slot overlaps with existing bookings
    const isBooked = existingBookings.some(booking => {
      const bStart = new Date(booking.startTime);
      const bEnd = new Date(booking.endTime);
      
      // Check for overlap
      return (
        (isBefore(currentSlot, bEnd) && !isBefore(slotEnd, bStart)) ||
        (format(currentSlot, 'HH:mm') === format(bStart, 'HH:mm'))
      );
    });

    if (!isBooked) {
      slots.push(format(currentSlot, 'HH:mm'));
    }

    // Fixed increment (e.g., 30 mins) or use duration
    currentSlot = addMinutes(currentSlot, 30); 
  }

  return slots;
};
