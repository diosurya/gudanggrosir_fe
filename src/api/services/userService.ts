import apiClient from "../axios";
import { API_ENDPOINTS } from "../endpoints";

export const userService = {
  async getAll(params?: any) {
    return apiClient.get(API_ENDPOINTS.users, { params });
  },

  async getById(id: number) {
    return apiClient.get(`${API_ENDPOINTS.users}/${id}`);
  },

  async create(data: any) {
    return apiClient.post(API_ENDPOINTS.users, data);
  },

  async update(id: number, data: any) {
    return apiClient.put(`${API_ENDPOINTS.users}/${id}`, data);
  },

  async remove(id: number) {
    return apiClient.delete(`${API_ENDPOINTS.users}/${id}`);
  },
};
