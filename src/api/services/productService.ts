import apiClient from "../axios"
import { API_ENDPOINTS } from "../endpoints"

export interface Product {
  id: number
  name: string
  slug: string
  status?: string
  description?: string
  short_description?: string
  sku?: string
  barcode?: string
  price: number
  compare_price?: number
  cost_price?: number
  track_quantity?: boolean
  quantity?: number
  min_quantity?: number
  created_at?: string
  updated_at?: string
}

export const productService = {
  getAll(params?: any) {
    return apiClient.get(API_ENDPOINTS.products, { params })
  },

  get(id: number) {
    return apiClient.get(`${API_ENDPOINTS.products}/${id}`)
  },

  create(data: Partial<Product>) {
    return apiClient.post(API_ENDPOINTS.products, data)
  },

  update(id: number, data: Partial<Product>) {
    return apiClient.put(`${API_ENDPOINTS.products}/${id}`, data)
  },

  delete(id: number) {
    return apiClient.delete(`${API_ENDPOINTS.products}/${id}`)
  },

  getVariants(productId: number) {
    return apiClient.get(`${API_ENDPOINTS.products}/${productId}/variants`)
  },

  createVariant(productId: number, data: any) {
    return apiClient.post(`${API_ENDPOINTS.products}/${productId}/variants`, data)
  },

  search(query: string) {
    return apiClient.get(`${API_ENDPOINTS.products}/search`, { params: { q: query } })
  },
}
