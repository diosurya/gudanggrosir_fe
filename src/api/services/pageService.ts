import apiClient from "../axios";
import { API_ENDPOINTS } from "../endpoints";

export interface Page {
  id: string;
  slug: string;
  title: string;
  content?: string;
  banner_image_id?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  canonical_url?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_type?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  twitter_card?: string;
  structured_data?: string;
  is_published: boolean;
  published_at?: string;
  deleted_at?: string;
  created_at: string;
  updated_at: string;
  bannerImage?: {
    id: string;
    url: string;
    name: string;
  };
}

export interface Pagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

export const pageService = {
  getAll(params?: any): Promise<PaginatedResponse<Page>> {
    return apiClient.get<PaginatedResponse<Page>>("/pages", { params })
      .then(res => res.data);
  },

  async getById(id: string) {
    return apiClient.get<{ success: boolean; data: Page }>(`/pages/${id}`)
      .then(res => res.data);
  },

  async create(payload: Partial<Page>) {
    return apiClient.post<{ success: boolean; data: Page }>("/pages", payload)
      .then(res => res.data);
  },

  async update(id: string, payload: Partial<Page>) {
    return apiClient.put<{ success: boolean; data: Page }>(`/pages/${id}`, payload)
      .then(res => res.data);
  },

  async delete(id: string) {
    return apiClient.delete<{ success: boolean }>(`/pages/${id}`)
      .then(res => res.data);
  }
};