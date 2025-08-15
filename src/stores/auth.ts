import { defineStore } from 'pinia';
import { router } from '@/router';
import { fetchWrapper } from '@/utils/helpers/fetch-wrapper';

const baseUrl = `${import.meta.env.VITE_API_URL}/users`;

export interface User {
  id: number;
  username: string;
  email: string;
  roles?: string[]; // optional roles untuk role-based access
  token?: string;   // JWT token
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,          // user saat login
    returnUrl: null as string | null    // untuk redirect setelah login
  }),
  getters: {
    isLoggedIn: (state) => !!state.user,
    isAdmin: (state) => state.user?.roles?.includes('admin') || false
  },
  actions: {
    initialize() {
      // ambil user dari localStorage jika ada
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          this.user = JSON.parse(storedUser) as User;
        } catch (err) {
          console.error('Failed to parse user from localStorage', err);
          localStorage.removeItem('user');
        }
      }
    },

    async login(username: string, password: string) {
      try {
        const user = await fetchWrapper.post<User>(`${baseUrl}/authenticate`, { username, password });
        this.user = user;
        localStorage.setItem('user', JSON.stringify(user));
        // redirect handled via returnUrl or default
        router.push(this.returnUrl || '/admin/dashboard');
      } catch (error) {
        console.error('Login failed', error);
        throw error; // bisa ditangani di komponen
      }
    },

    logout() {
      this.user = null;
      this.returnUrl = null;
      localStorage.removeItem('user');
      router.push('/login');
    },

    setReturnUrl(url: string | null) {
      this.returnUrl = url;
    }
  }
});
