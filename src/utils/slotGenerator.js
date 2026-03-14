import { 
  addMinutes, 
  format, 
  isBefore, 
  parse, 
  startOfDay, 
  endOfDay, 
  addHours,
  isAfter,
  isSameDay,
  getDay
} from 'date-fns';

/**
 * Advanced slot generation engine.
 * Handles buffers, minimum notice, and daily limits.
 */
export const generateAvailableSlots = (date, availability, meetingType, existingBookings) => {
  const dayOfWeek = getDay(date);
  const dateStr = format(date, 'yyyy-MM-dd');
  
  // 1. Check Daily Limits
  const bookingsToday = existingBookings.filter(b => 
    isSameDay(new Date(b.startTime), date) && b.status !== 'cancelled'
  );
  
  if (meetingType.dailyLimit && bookingsToday.length >= meetingType.dailyLimit) {
    return [];
  }

  // 2. Determine Working Hours (Recurring vs Overrides)
  let dayConfig = {
    active: availability.workingDays.includes(dayOfWeek),
    hours: availability.workingHours
  };

  if (availability.overrides && availability.overrides[dateStr]) {
    const override = availability.overrides[dateStr];
    if (override.unavailable) return [];
    dayConfig = { active: true, hours: override.hours };
  }

  if (!dayConfig.active) return [];

  const { start, end } = dayConfig.hours;
  const startTime = parse(start, 'HH:mm', date);
  const endTime = parse(end, 'HH:mm', date);
  
  // 3. Minimum Scheduling Notice
  const now = new Date();
  const minimumNoticeTime = addHours(now, meetingType.minNotice || 0);

  const slots = [];
  let currentSlot = startTime;

  const duration = meetingType.duration;
  const bufferBefore = meetingType.bufferBefore || 0;
  const bufferAfter = meetingType.bufferAfter || 0;

  while (isBefore(addMinutes(currentSlot, duration), endTime) || format(addMinutes(currentSlot, duration), 'HH:mm') === format(endTime, 'HH:mm')) {
    const slotStart = currentSlot;
    const slotEnd = addMinutes(currentSlot, duration);
    
    // Check if slot is after minimum notice
    const isAfterNotice = isAfter(slotStart, minimumNoticeTime);

    if (isAfterNotice) {
      // Check for overlap including buffers
      const isBooked = existingBookings.some(booking => {
        if (booking.status === 'cancelled') return false;
        
        const bStart = new Date(booking.startTime);
        const bEnd = new Date(booking.endTime);
        
        // Add buffers to the existing booking for overlap calculation
        const bookingBufferStart = addMinutes(bStart, -bufferAfter); // Buffer after current meeting is before next
        const bookingBufferEnd = addMinutes(bEnd, bufferBefore);    // Buffer before current meeting is after prev
        
        // Simplified overlap check
        return (isBefore(slotStart, bEnd) && isAfter(slotEnd, bStart)) ||
               (isBefore(slotStart, addMinutes(bEnd, bufferBefore)) && isAfter(slotStart, bStart)) ||
               (isBefore(addMinutes(slotStart, -bufferAfter), bEnd) && isAfter(slotStart, bStart));
      });

      if (!isBooked) {
        slots.push(format(slotStart, 'HH:mm'));
      }
    }

    // Standard increment (30 mins)
    currentSlot = addMinutes(currentSlot, 30); 
  }

  return slots;
};
