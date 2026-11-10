import { configureStore } from '@reduxjs/toolkit';
import catalogue from './catalogueSlice.js';
import wishlist, { STORAGE_KEY, loadWishlist } from './wishlistSlice.js';
import profile from './profileSlice.js';

export function createStore(preloadedState) {
  const store = configureStore({
    reducer: { catalogue, wishlist, profile },
    preloadedState: { wishlist: loadWishlist(), ...preloadedState },
  });
  let last = store.getState().wishlist.items;
  store.subscribe(() => {
    const next = store.getState().wishlist.items;
    if (next === last) return;
    last = next;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* storage may be full or blocked; the wishlist still works for this session */
    }
  });
  return store;
}
