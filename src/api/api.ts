import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // URL do seu backend Spring Boot
});

// Intercepta requisições para incluir o token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
