import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

// Layouts
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';

// Dashboard Pages
import Dashboard from './pages/dashboard/Dashboard';
import MeetingTypes from './pages/meetingTypes/MeetingTypes';
import Availability from './pages/availability/Availability';
import Bookings from './pages/bookings/Bookings';
import Calendar from './pages/calendar/Calendar';
import EmailLogs from './pages/emails/EmailLogs';
import Settings from './pages/settings/Settings';

// Public Pages
import PublicBooking from './pages/publicBooking/PublicBooking';

// Components
import { useToast } from './context/UIContext';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Public Booking Route */}
      <Route path="/book/:username/:typeSlug" element={<PublicBooking />} />

      {/* App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="event-types" element={<MeetingTypes />} />
        <Route path="availability" element={<Availability />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="emails" element={<EmailLogs />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
