import axios, {
    AxiosError,
    InternalAxiosRequestConfig,
} from "axios";

import { api } from "../config/api";
import { TokenStorage } from "../store/tokenStore";

interface RetryRequest extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

api.interceptors.response.use((response) => response, async (error: AxiosError) => {
    const originalRequest = error.config as RetryRequest;

    if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
            const refreshToken = await TokenStorage.getRefreshToken();

            if (!refreshToken) {
                throw new Error("Refresh Token no encontrado");
            }
            //Aqui necesito que me saques la informacion del usuario y me la vuelvas a enviar: nombre y email para que yo pueda crear el JWT
            const nombre = "bryan";
            const email = "a@a.com";
            const response = await axios.post(
                "http://IP API/renueve_token",
                {
                    nombre,
                    email
                },
                {
                    headers: {
                        "x-refresh-token": refreshToken
                    }
                }
            );

            const newAccessToken = response.data.jwt;
            const newRefreshToken = response.data.refresh_token;

            await TokenStorage.saveTokens(newAccessToken, newRefreshToken);
            // Y LA PETICION ANTERIOR SE VUELVE A EJECUTAR. OSEA QUE AQUI NO PASO NADA 
            originalRequest.headers.Authorization =
                `Bearer ${newAccessToken}`;

            return api(originalRequest);
        } catch (refreshError) {
            await TokenStorage.clearTokens();

            return Promise.reject(refreshError);
        }
    }

    return Promise.reject(error);
}
);