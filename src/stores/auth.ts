import { defineStore } from "pinia";
import { router } from "@/router";
import apiClient from "@/api/axios";

export interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  roles?: string[]; 
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    token: localStorage.getItem("token") || null,
    returnUrl: null as string | null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.user?.roles?.includes("admin") || false,
  },
  actions: {
    initialize() {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      if (storedUser && storedToken) {
        try {
          this.user = JSON.parse(storedUser) as User;
          this.token = storedToken;
        } catch (err) {
          console.error("Failed to parse user/token from localStorage", err);
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
    },

    async login(login: string, password: string) {
      try {
        const response = await apiClient.post("/auth/login", { login, password });
        const { user, token } = response.data;

        this.user = user;
        this.token = token;

        // simpan ke localStorage
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("token", token);

        // redirect
        router.push(this.returnUrl || "/admin/dashboard");
      } catch (error: any) {
        console.error("Login failed:", error);
        throw error.response?.data?.message || "Login gagal";
      }
    },

    async logout() {
      try {
        if (this.token) {
          await apiClient.post(
            '/auth/logout',
            {},
            {
              headers: {
                Authorization: `Bearer ${this.token}`,
              },
            }
          );
        }
      } catch (error) {
        console.warn('Logout API error, forcing client logout');
      } finally {
        this.user = null;
        this.token = null;
        this.returnUrl = null;
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        router.push('/login');
      }
    }

  },
});
