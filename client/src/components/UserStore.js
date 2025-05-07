// src/store/UserStore.js
import { create } from 'zustand';

const useUserStore = create(set => ({
  user: null,
  setUser: (userData) => set({ user: userData }),
  logout: () => set({ user: null }),
  clearUser: () => set({ user: null }),
  isUserChecked: false,
  setIsUserChecked: (checked) => set({ isUserChecked: checked }),

}));

export default useUserStore;
