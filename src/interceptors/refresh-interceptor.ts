import axios, {
    AxiosError,
    InternalAxiosRequestConfig,
} from "axios";

import { api } from "../config/api";
import { useAuthStore } from "../store/authStore";
import { TokenStorage } from "../store/tokenStore";

interface RetryRequest extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

let refreshPromise: Promise<string> | null = null;

api.interceptors.response.use((response) => response, async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequest | undefined;
    const requestUrl = originalRequest?.url ?? "";
 
    if (error.response?.status !== 401 ||!originalRequest ||originalRequest._retry ||/\/(login|registro|renueve_token)(\?|$)/.test(requestUrl)) {
        return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
        if (!refreshPromise) {
            refreshPromise = (async () => {
                const refreshToken = await TokenStorage.getRefreshToken();
                const activeUser = useAuthStore.getState().activeUser;

                if (!refreshToken || !activeUser) {
                    throw new Error("No hay sesión o refresh token disponible");
                }

                const response = await axios.post(
                    `${api.defaults.baseURL}/renueve_token`,
                    {
                        nombre: activeUser.nombre,
                        email: activeUser.email,
                    },
                    {
                        headers: {
                            "x-refresh-token": refreshToken,
                        },
                    },
                );

                const newAccessToken = response.data.jwt as string;
                const newRefreshToken = response.data.refresh_token as string;

                if (!newAccessToken || !newRefreshToken) {
                    throw new Error("Respuesta de renovación inválida");
                }
                await TokenStorage.clearTokens();
                await TokenStorage.saveTokens(newAccessToken, newRefreshToken);
                return newAccessToken;
            })().finally(() => {
                refreshPromise = null;
            });
        }

        const newAccessToken = await refreshPromise;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
    } catch (refreshError) {
        await TokenStorage.clearTokens();
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
    }
}
);