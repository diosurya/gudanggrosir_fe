import apiClient from "../axios";
import { API_ENDPOINTS } from "../endpoints";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CategoryCreatePayload {
  name: string;
  slug: string;
  description?: string;
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  total: number;
  per_page: number;
  last_page: number;
}

export const categoryService = {
  async getAll(params?: any) {
    return apiClient.get<PaginatedResponse<Category>>('/categories', { params });
  },

  async getById(id: number | string) {
    return apiClient.get<Category>(`/categories/${id}`);
  },

  async create(payload: CategoryCreatePayload) {
    return apiClient.post<Category>('/categories', payload);
  },

  async update(id: number | string, payload: Partial<CategoryCreatePayload>) {
    return apiClient.put<Category>(`/categories/${id}`, payload);
  },

  async delete(id: number | string) {
    return apiClient.delete(`/categories/${id}`);
  },
};