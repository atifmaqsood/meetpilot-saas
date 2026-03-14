import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBookings } from '../store/slices/bookingSlice';
import { fetchMeetingTypes } from '../store/slices/meetingSlice';
import { fetchAvailability } from '../store/slices/availabilitySlice';

export const useBookings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { items, loading, error } = useSelector(state => state.bookings);

  useEffect(() => {
    if (user && items.length === 0) {
      dispatch(fetchBookings(user.id));
    }
  }, [user, dispatch, items.length]);

  return { bookings: items, loading, error };
};

export const useMeetingTypes = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { items, loading, error } = useSelector(state => state.meetings);

  useEffect(() => {
    if (user && items.length === 0) {
      dispatch(fetchMeetingTypes(user.id));
    }
  }, [user, dispatch, items.length]);

  return { meetings: items, loading, error };
};

export const useAvailability = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { data, loading, error } = useSelector(state => state.availability);

  useEffect(() => {
    if (user && !data) {
      dispatch(fetchAvailability(user.id));
    }
  }, [user, dispatch, data]);

  return { availability: data, loading, error };
};
