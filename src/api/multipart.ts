import apiClient from "./axios"

export async function multipartRequest(
  method: "post" | "put" | "patch",
  url: string,
  formData: FormData
) {
  return apiClient.request({
    method,
    url,
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  })
}
