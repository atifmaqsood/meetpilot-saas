import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import meetingReducer from './slices/meetingSlice';
import bookingReducer from './slices/bookingSlice';
import availabilityReducer from './slices/availabilitySlice';
import notificationReducer from './slices/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    meetings: meetingReducer,
    bookings: bookingReducer,
    availability: availabilityReducer,
    notifications: notificationReducer,
  },
});
