import * as sql from 'mssql';
export interface IParametro {
  nombre: string;
  tipo:
    | sql.ISqlTypeFactoryWithLength
    | sql.ISqlTypeFactoryWithNoParams
    | sql.ISqlTypeFactoryWithPrecisionScale
    | sql.ISqlTypeFactoryWithScale
    | sql.ISqlTypeFactoryWithTvpType;
  valor: any;
}

/*export interface TagdbLocal {
  tagName: string;
  tipo:
    | "boolean"
    | "int16"
    | "int32"
    | "real_div_10"
    | "real";
}*/

export interface Sensores{
  id: string, 
  name_db: string,
  tipo_dato: string,
}

export interface TagValordbLocal {
  sensor: string; //Id del sensor en la base de datos del server
  tagName: string;
  fecha_hora_value: Date;
  value: string;
}

