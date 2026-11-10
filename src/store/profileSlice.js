import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api.js';

export const loadProfile = createAsyncThunk('profile/load', async (_, { rejectWithValue }) => {
  try {
    return (await api('/api/profile')).profile;
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

export const saveProfile = createAsyncThunk('profile/save', async (values, { rejectWithValue }) => {
  try {
    return (await api('/api/profile', { method: 'POST', body: JSON.stringify(values) })).profile;
  } catch (e) {
    return rejectWithValue({ message: e.message, fields: e.fields });
  }
});

const slice = createSlice({
  name: 'profile',
  initialState: { data: null, status: 'idle', error: null, saveStatus: 'idle', saveError: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(loadProfile.pending, (s) => {
      s.status = 'loading';
      s.error = null;
    })
      .addCase(loadProfile.fulfilled, (s, a) => {
        s.status = 'succeeded';
        s.data = a.payload;
      })
      .addCase(loadProfile.rejected, (s, a) => {
        s.status = 'failed';
        s.error = a.payload || a.error.message;
      })
      .addCase(saveProfile.pending, (s) => {
        s.saveStatus = 'saving';
        s.saveError = null;
      })
      .addCase(saveProfile.fulfilled, (s, a) => {
        s.saveStatus = 'saved';
        s.data = a.payload;
      })
      .addCase(saveProfile.rejected, (s, a) => {
        s.saveStatus = 'failed';
        s.saveError = a.payload || { message: a.error.message };
      });
  },
});

export default slice.reducer;
