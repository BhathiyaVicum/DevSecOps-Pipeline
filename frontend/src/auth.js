import { create } from 'zustand';

const storedUser = localStorage.getItem('user');
const storedToken = localStorage.getItem('token');

export const useAuth = create((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken || null,

  saveAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
    window.location.href = '/';
  },
}));