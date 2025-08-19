import apiClient from "../axios";


export interface Brand {
  id: number
  name: string
  slug: string
  created_at?: string
  updated_at?: string
}

export const brandService = {
  getAll(params?: any) {
    return apiClient.get("/brands", { params })
  },
  get(id: number) {
    return apiClient.get(`/brands/${id}`)
  },
  create(data: Partial<Brand>) {
    return apiClient.post("/brands", data)
  },
  update(id: number, data: Partial<Brand>) {
    return apiClient.put(`/brands/${id}`, data)
  },
  delete(id: number) {
    return apiClient.delete(`/brands/${id}`)
  },
}
