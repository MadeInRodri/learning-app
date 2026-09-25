// src/config/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "http://192.168.0.5:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});
