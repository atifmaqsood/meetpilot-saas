import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import mockDB from '../../services/mockDatabase';

export const fetchBookings = createAsyncThunk('bookings/fetchAll', async (userId) => {
  return mockDB.getBookingsByUserId(userId);
});

export const createBooking = createAsyncThunk('bookings/create', async (bookingData) => {
  return mockDB.create('bookings', { ...bookingData, status: 'confirmed' });
});

export const updateBookingStatus = createAsyncThunk('bookings/updateStatus', async ({ id, status }) => {
  return mockDB.update('bookings', id, { status });
});

const bookingSlice = createSlice({
  name: 'bookings',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.fulfilled, (state, action) => { state.items = action.payload; })
      .addCase(createBooking.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(updateBookingStatus.fulfilled, (state, action) => {
        const index = state.items.findIndex(b => b.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      });
  },
});

export default bookingSlice.reducer;
