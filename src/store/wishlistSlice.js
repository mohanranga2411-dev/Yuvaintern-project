import { createSlice } from '@reduxjs/toolkit';

export const STORAGE_KEY = 'kasavu.wishlist.v1';

export function loadWishlist() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(raw) ? { items: raw.filter((i) => Number.isInteger(i?.id)) } : { items: [] };
  } catch {
    return { items: [] };
  }
}

const slice = createSlice({
  name: 'wishlist',
  initialState: { items: [] },
  reducers: {
    toggle(state, { payload: { id, size = null } }) {
      const i = state.items.findIndex((x) => x.id === id);
      if (i >= 0) state.items.splice(i, 1);
      else state.items.push({ id, size });
    },
    setSize(state, { payload: { id, size } }) {
      const item = state.items.find((x) => x.id === id);
      if (item) item.size = size;
    },
    remove(state, { payload: id }) {
      state.items = state.items.filter((x) => x.id !== id);
    },
    clear(state) {
      state.items = [];
    },
  },
});

export const { toggle, setSize, remove, clear } = slice.actions;
export const selectWishlist = (s) => s.wishlist.items;
export const selectIsWished = (id) => (s) => s.wishlist.items.some((x) => x.id === id);
export default slice.reducer;
