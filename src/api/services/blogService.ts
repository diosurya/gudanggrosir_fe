import apiClient from "../axios";
import { API_ENDPOINTS } from "../endpoints";

export interface BlogImage {
  url: string;
  is_cover: boolean;
}

export interface Blog {
  id: number;
  title: string;
  cover_image?: string;
  slug: string;
  excerpt: string;
  content: string;
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  images: BlogImage[];
  category_id?: string;
  author_id: number;
  status: "draft" | "published" | "archived" | "scheduled";
  published_at: string;
  created_at: string;
  updated_at: string;
  category_name: string;
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
    const user = JSON.parse(sessionStorage.getItem("user") || "{}")

    const formData = new FormData()
    Object.entries({ ...payload, author_id: user?.id ?? null }).forEach(([key, val]) => {
      if (val !== null && val !== undefined) {
        if (key === "images") {
          val.forEach((img: any, index: number) => {
            formData.append(`images[${index}]`, img.file ?? img.url)
          })
        } else {
          formData.append(key, val as any)
        }
      }
    })

    return apiClient.post<Blog>(API_ENDPOINTS.blogs, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
  },

  async update(id: number | string, payload: Partial<Blog>) {
    return apiClient.put(`${API_ENDPOINTS.blogs}/${id}`, payload);
  },

  async delete(id: number | string) {
    return apiClient.delete(`${API_ENDPOINTS.blogs}/${id}`);
  },
};
