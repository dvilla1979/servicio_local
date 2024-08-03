import * as sql from 'mssql';
import { CONFIG } from '../config';
import { IParametro } from '../interfaces/db.interfaz';
import { HttpRespuestaError } from '../utilidades/httpRespuestaError';

class Conexion {
  public config: sql.config;

  constructor() {
    this.config = {
      user: CONFIG.DB_USER,
      password: CONFIG.DB_PASSWORD,
      database: CONFIG.BD_DATABASE,
      server: CONFIG.DB_HOST,
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
      },
      options: {
        encrypt: false,
        trustServerCertificate: true
      }
    };
  }

async Ejecutar(procedimiento: string, parametros: IParametro[] = []): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let pool!: sql.ConnectionPool;

      try {
        pool = await new sql.ConnectionPool(this.config).connect();
      } catch (error) {
        console.log('ERROR EJECUTAR SP', error.message);
        //reject(new HttpRespuestaError('No se puedo conectar a la db', 500));
        return;
      }

      try {
        const consulta = pool.request();

        parametros.forEach(function (elemento) {
          consulta.input(elemento.nombre, elemento.tipo, elemento.valor);
        });

        const { recordset } = await consulta.execute(procedimiento);
            resolve(recordset);
      } catch ({ message, statusCode = 500 }) {
        console.log('ERROR EJECUTAR SP', message);
      //  reject(new HttpRespuestaError(message, statusCode));
      } finally {
        if (pool && typeof pool.close === 'function') {
          pool.close();
        }
      }
    });
  }
}

export default Conexion;