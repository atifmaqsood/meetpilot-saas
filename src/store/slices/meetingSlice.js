import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import mockDB from '../../services/mockDatabase';

export const fetchMeetingTypes = createAsyncThunk('meetings/fetchAll', async (userId) => {
  const all = mockDB.getAll('meetingTypes');
  return all.filter(m => m.userId === userId);
});

export const addMeetingType = createAsyncThunk('meetings/add', async (meetingData) => {
  return mockDB.create('meetingTypes', meetingData);
});

export const updateMeetingType = createAsyncThunk('meetings/update', async ({ id, updates }) => {
  return mockDB.update('meetingTypes', id, updates);
});

export const deleteMeetingType = createAsyncThunk('meetings/delete', async (id) => {
  mockDB.delete('meetingTypes', id);
  return id;
});

const meetingSlice = createSlice({
  name: 'meetings',
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMeetingTypes.fulfilled, (state, action) => { state.items = action.payload; })
      .addCase(addMeetingType.fulfilled, (state, action) => { state.items.push(action.payload); })
      .addCase(updateMeetingType.fulfilled, (state, action) => {
        const index = state.items.findIndex(m => m.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteMeetingType.fulfilled, (state, action) => {
        state.items = state.items.filter(m => m.id !== action.payload);
      });
  },
});

export default meetingSlice.reducer;
