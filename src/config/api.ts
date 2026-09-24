import axios from "axios";

export const api = axios.create({
    //IP CAMBIANTE: VER QUE IP EXPONE TU PC DONDE ESTAS CORRIENDO EL BACKEND Y COLOCARLA ACA
  baseURL: "http://localhost:3000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

import "./interceptors";
