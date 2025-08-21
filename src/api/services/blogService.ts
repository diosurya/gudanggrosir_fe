import apiClient from "../axios";
import { API_ENDPOINTS } from "../endpoints";

export interface BlogImage {
  url: string;
  is_cover: boolean;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  images: BlogImage[];
  category_id?: string;
  author_id: number;
  status: "Draft" | "Published" | "Deactived";
  published_at: string;
  created_at: string;
  updated_at: string;
  author: {
    id: number;
    name: string;
    username: string;
    email: string;
    avatar_url: string;
    bio: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  total: number;
  per_page: number;
  last_page: number;
}

export const blogService = {
  async getAll(params?: any) {
    return apiClient.get<PaginatedResponse<Blog>>(API_ENDPOINTS.blogs, { params });
  },

  async getById(id: number | string) {
    return apiClient.get<Blog>(`${API_ENDPOINTS.blogs}/${id}`);
  },

  async create(payload: Partial<Blog>) {
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");

    const finalPayload = {
      ...payload,
      author_id: user?.id ?? null
    };

    return apiClient.post<Blog>(API_ENDPOINTS.blogs, finalPayload);
  },

  async update(id: number | string, payload: Partial<Blog>) {
    return apiClient.put(`${API_ENDPOINTS.blogs}/${id}`, payload);
  },

  async delete(id: number | string) {
    return apiClient.delete(`${API_ENDPOINTS.blogs}/${id}`);
  },
};
