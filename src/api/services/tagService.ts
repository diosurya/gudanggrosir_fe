import apiClient from "../axios";
import { API_ENDPOINTS } from "../endpoints";

export interface Tag {
  id: number
  name: string
  slug: string
  created_at?: string
  updated_at?: string
}

export const tagService = {
  getAll(params?: any) {
    return apiClient.get("/tags", { params })
  },
  get(id: number) {
    return apiClient.get(`/tags/${id}`)
  },
  create(data: Partial<Tag>) {
    return apiClient.post("/tags", data)
  },
  update(id: number, data: Partial<Tag>) {
    return apiClient.put(`/tags/${id}`, data)
  },
  delete(id: number) {
    return apiClient.delete(`/tags/${id}`)
  },
}
