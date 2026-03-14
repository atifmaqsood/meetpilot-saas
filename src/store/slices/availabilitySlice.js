import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import mockDB from '../../services/mockDatabase';

export const fetchAvailability = createAsyncThunk('availability/fetch', async (userId) => {
  return mockDB.getAvailability(userId);
});

export const saveAvailability = createAsyncThunk('availability/save', async ({ userId, availability }) => {
  return mockDB.updateAvailability(userId, availability);
});

const availabilitySlice = createSlice({
  name: 'availability',
  initialState: {
    data: null,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailability.fulfilled, (state, action) => { state.data = action.payload; })
      .addCase(saveAvailability.fulfilled, (state, action) => { state.data = action.payload; });
  },
});

export default availabilitySlice.reducer;
