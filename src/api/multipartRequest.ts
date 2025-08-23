import apiClient from "./axios";

export async function multipartRequest(
  method: "post" | "put" | "patch",
  url: string,
  formData: FormData
) {
  if (method !== "post") {
    formData.append("_method", method.toUpperCase());
    method = "post";
  }

  return apiClient.request({
    method,
    url,
    data: formData,
    withCredentials: true,
  });
}
