import * as sql from 'mssql';
import moment from 'moment';

import Conexion from  '../db/conexion';
import { IParametro, TagValordbLocal, Sensores } from '../interfaces/db.interfaz';

import { sensors } from '../api_server/sensors';
import { valores } from '../api_server/valores';

import logger from '../utilidades/logger';


//Funcion que lee de la base de datos rokadb los valores del tag pasado como parametros 
//en las fechas desde hasta
const consultaValorTag  = async (tagname :string,fecha_desde: string, fechahasta: string) => {
  
    try {

        const conexion = new Conexion();

        const parametros: IParametro[] = [
            {
                nombre: 'tag_name',   
                tipo: sql.NVarChar,
                valor: tagname//'Temp_Real_Prom_Cal_S7_C29'
            },
            {
                nombre: 'fecha_desde',
                tipo: sql.DateTime,
                valor: fecha_desde//'02-01-2023 01:15:00.877'
            },
            {
                nombre: 'fecha_hasta',
                tipo: sql.DateTime,
                valor: fechahasta//'03-02-2023 08:40:18.877'
            }
        ];

        const resultado = await conexion.Ejecutar('consulta_valor', parametros);

        return resultado;
  
    } catch (error)  {
        logger.error("Error al ejecutar procedimiento consulta_valor en la base de datos local del roka" + error.message);        
    }
};


//Funcion que devuelve la lista de sensores del friogrifico pasado como parametro
export async function LeeListaSensores(frio: string): Promise<Sensores[]> {

        try {
            //Lee lista de sensores de la api del back end para leer valores en la db local
            const r = await sensors.getAll({name_frio: frio});

            const dataArray = r.data.data;

            //Convierte la parte 'data' en un array de objetos
            const arraySensors = dataArray.map((item:any) => {
                return {id: item.id, 
                        name_db: item.name_db,
                        tipo_dato: item.tipo_dato,
                }
            })

            console.log("Array de objetos ",arraySensors);

            return arraySensors;
            
        } catch (error) {
            logger.error("Error al leer lista de sensores de la api con error" + error.message);
            return [];
        }



}

//Funcion que lee de la base de datos local el valor de los tags del archivo tagsdbLocal.json
const LeeValoresTagdbLocal = async (arraySensors: Sensores[]) => {
 
    try
    {
      
        if (arraySensors.length === 0){
            return 0;
        }

        let hayValor:boolean = false;

        const TagsValordbLocales: TagValordbLocal[] = [];

        //Fecha desde, se restan tres horas porque el sql lo guarda en hora universal
        const fechadesde = moment().add("-03:02").format();

        const fechahasta = moment().add("-03:00").format();

        for(const elementSensor of arraySensors){
            //Devuelve un arreglo con los valores del tag entre las fechas desde y hasta
 
            const ValorTagdbLocales = await consultaValorTag (elementSensor.name_db, fechadesde, fechahasta);
              
            if(ValorTagdbLocales != undefined) {
                //Se usa solo el ultimo valor de la lista recibida que es el ultimo guardado
                if (ValorTagdbLocales.length > 0){
                    TagsValordbLocales.push({
                        sensor: elementSensor.id,
                        tagName: elementSensor.name_db,
                        fecha_hora_value:  moment(ValorTagdbLocales[ValorTagdbLocales.length -1].fechahora).add("03:00").toDate(),
                        value: ValorTagdbLocales[ValorTagdbLocales.length -1].valor,
                    });
                    hayValor = true;

                }
            }
        }

        if(hayValor)
            return TagsValordbLocales;
        else
            return 0;

      

    } catch (error)  {
        logger.error("Error al leer valores de la base de datos local del roka" + error.message);   
        return 0;
    }  

};


//Funcion que se ejecuta cada 2 minutos para leer el valor de los tags desde la base de datos local
//despues que se obtiene el resultado se debe guardar en la base de datos del servidor en la nube
export async function ejecutarCadaDosMinutos(frio: string/*arraySensors: Sensores[]*/): Promise<void> {

    let ArraySensores: Sensores[] = [];
    let Contador_Fallas = 0;

    while (true) {

        //Lee lista de sensores, una vez que ya tiene la lista no la lee mas
        if (ArraySensores.length == 0) {
            try {
                ArraySensores = await LeeListaSensores(frio);
                if (ArraySensores.length == 0) {
                    Contador_Fallas = Contador_Fallas + 1;
                    logger.error("No se pudo obtener lista de sensores, cantidad de reintentos=" + Contador_Fallas);
                    console.log(`Cantidas de fallas: ${Contador_Fallas}`);
                }
                else
                    logger.info("Se obtuvo con exito la lista de sensores de la api")                   
            } catch (error) {
                logger.error("Error al leer lista de sensores de la api del bakend con error" + error.message);              
            }
        }
        else
        {
            Contador_Fallas = 0;
        }

        if (ArraySensores.length > 0) {
            // Iniciar la ejecución de la función
            try {
                const ValoresTagdbLocal =  await LeeValoresTagdbLocal(ArraySensores);
                //Pregunta si pudo leer algun valor de los tags en la db local
                if(ValoresTagdbLocal != 0) {
                    try {
                        // Enviar los valores a la api del backend
                        await valores.postValores(ValoresTagdbLocal)
                    } catch (error) {
                        logger.error("Error al enviar valores a la api con error" + error.message);
                    }
                }
                else
                    logger.error("No se pudiero leer valores de la base de datos local del roka");    
            }
            catch (error)  {
                logger.error("Error al leer valores de la base de datos local del roka" + error.message);   
            }            
        }   

        await new Promise(resolve => setTimeout(resolve, 2 * 60 * 1000)); // Esperar 2 minutos    
    }
}

    /*   LeeListaSensores(frio).
            then((ArraySensores) => {
                if (ArraySensores.length > 0) {
                    // Iniciar la ejecución de la función
                    try {
                        LeeValoresTagdbLocal(ArraySensores).then( (ValoresTagdbLocal) => {
                            //Pregunta si pudo leer algun valor de los tags en la db local
                            if(ValoresTagdbLocal != 0) {
                                    valores.postValores(ValoresTagdbLocal).then(()=>
                                        console.log("Valores enviados a la api del backend")
                                    ).catch ((error) => {
                                        console.log(error);
                                    });
                            }
                            else
                                console.log("No se pudieron leer valores de la base de datos local")    
                        });
                    }
                    catch (error)  {
                        console.log("Error al enviar valores a la api del backend", error);   
                    }            
                }
            });*/    




  
