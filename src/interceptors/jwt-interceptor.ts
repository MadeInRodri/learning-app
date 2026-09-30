import { api } from "../config/api";
import { TokenStorage } from "../store/tokenStore";
api.interceptors.request.use(
  async (config) => {
    const accessToken = await TokenStorage.getAccessToken();
    console.log("jwt");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);
