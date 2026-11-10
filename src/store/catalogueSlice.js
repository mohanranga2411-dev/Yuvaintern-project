import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../api.js';

export const fetchProducts = createAsyncThunk(
  'catalogue/fetch',
  async (query, { rejectWithValue }) => {
    try {
      return await api(`/api/products?${query}`);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  },
);

const initial = { items: [], total: 0, page: 1, pages: 1, facets: {}, status: 'idle', error: null, requestId: null };

const slice = createSlice({
  name: 'catalogue',
  initialState: initial,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchProducts.pending, (s, a) => {
      s.status = 'loading';
      s.error = null;
      s.requestId = a.meta.requestId;
    })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        if (s.requestId !== a.meta.requestId) return; // ignore stale responses
        Object.assign(s, a.payload, { status: 'succeeded' });
      })
      .addCase(fetchProducts.rejected, (s, a) => {
        if (s.requestId !== a.meta.requestId) return;
        s.status = 'failed';
        s.error = a.payload || a.error.message;
      });
  },
});

export default slice.reducer;
