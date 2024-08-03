import { TagValordbLocal } from "../interfaces/db.interfaz";
import { instance } from "./base.api";

const endpoint = "/createValor";

//Carga nuevos valores de sensores en la api
export const valores = {
    postValor: function (data: TagValordbLocal){
        return instance.post(endpoint, data)
    },
    postValores: function (data: TagValordbLocal[]){
        return instance.post("/createValores", data);
    }

};


