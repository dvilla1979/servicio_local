import { instance } from "./base.api";

const endpoint = "frio/sensors";

//Obtiene lista de senores de la api
export const sensors = {
    getAll: function ({name_frio} : {name_frio: string}){
        return instance.get(endpoint, {
            params: {name_frio}
        });
    }
}

