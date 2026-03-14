import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Protected Pages
import Dashboard from './pages/dashboard/Dashboard';
import MeetingTypes from './pages/meetingTypes/MeetingTypes';
import Availability from './pages/availability/Availability';
import Bookings from './pages/bookings/Bookings';
import Calendar from './pages/calendar/Calendar';

// Public Pages
import PublicBooking from './pages/publicBooking/PublicBooking';

const ProtectedRoute = ({ children }) => {
  const { token } = useSelector((state) => state.auth);
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  const { user } = useSelector((state) => state.auth);
  
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Public Booking Route */}
      <Route path="/book/:username/:typeSlug" element={<PublicBooking />} />

      {/* App Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="event-types" element={<MeetingTypes />} />
        <Route path="availability" element={<Availability />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="calendar" element={<Calendar />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
