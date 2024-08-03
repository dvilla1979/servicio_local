import axios from "axios"

export const BASE_URL = "http://127.0.0.1:8000/api/";

export const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "api-key": "clave secreta"
    }

})