import apiClient from "../axios";
import { API_ENDPOINTS } from "../endpoints";

export interface CategoryProduct {
  id: number
  name: string
  slug: string
  parent_id?: number | null
  created_at?: string
  updated_at?: string
}

export const categoryProductService = {
  getAll(params?: any) {
    return apiClient.get("/category_products", { params })
  },
  get(id: number) {
    return apiClient.get(`/category_products/${id}`)
  },
  create(data: Partial<CategoryProduct>) {
    return apiClient.post("/category_products", data)
  },
  update(id: number, data: Partial<CategoryProduct>) {
    return apiClient.put(`/category_products/${id}`, data)
  },
  delete(id: number) {
    return apiClient.delete(`/category_products/${id}`)
  },
  getTree() {
    return apiClient.get("/categories/tree")
  },
}
