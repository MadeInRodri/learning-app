// CONEXIÓN A LA API
import axios from "axios";

export const api = axios.create({
  baseURL: "http://192.168.31.83:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
