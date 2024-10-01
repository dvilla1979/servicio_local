import axios from "axios"
import {CONFIG} from "../config"

export const BASE_URL = CONFIG.API_;//"http://127.0.0.1:8000/api/";

export const instance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "api-key": CONFIG.API_KEY//"clave secreta"
    }

})