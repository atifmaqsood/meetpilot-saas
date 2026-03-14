import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import mockDB from '../../services/mockDatabase';

export const login = createAsyncThunk('auth/login', async ({ email, password }, { rejectWithValue }) => {
  const user = mockDB.getUserByEmail(email);
  if (user && user.password === password) {
    const token = 'fake-jwt-' + Math.random().toString(36).substr(2);
    localStorage.setItem('meetpilot_token', token);
    localStorage.setItem('meetpilot_user', JSON.stringify(user));
    return { user, token };
  }
  return rejectWithValue('Invalid email or password');
});

export const signup = createAsyncThunk('auth/signup', async (userData, { rejectWithValue }) => {
  const existing = mockDB.getUserByEmail(userData.email);
  if (existing) return rejectWithValue('User already exists');
  const user = mockDB.create('users', userData);
  const token = 'fake-jwt-' + Math.random().toString(36).substr(2);
  localStorage.setItem('meetpilot_token', token);
  localStorage.setItem('meetpilot_user', JSON.stringify(user));
  return { user, token };
});

const initialState = {
  user: JSON.parse(localStorage.getItem('meetpilot_user')) || null,
  token: localStorage.getItem('meetpilot_token') || null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('meetpilot_token');
      localStorage.removeItem('meetpilot_user');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(signup.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(signup.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
