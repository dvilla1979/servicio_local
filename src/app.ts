import express from 'express';
import routes from './routes/routes';
import { CONFIG } from './config';
import {ejecutarCadaDosMinutos} from './controladores/tags.controladores';
import logger from './utilidades/logger';
import Conexion from './db/conexion';

const app: express.Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', routes);

app.listen(CONFIG.APP_PORT, () => {
    //logger.info(`Servicio Iniciado corriendo en el puerto ${CONFIG.APP_PORT}`);
   // console.log(`Corriendo en el puerto ${CONFIG.APP_PORT}`);
    logger.info(`Servicio Iniciado en el frigorífico: ${CONFIG.FRIO_NAME}  `);
   // console.log(`Corriendo en el puerto ${CONFIG.APP_PORT}`);
    
});


const conexion = new Conexion();

conexion.conectar();


ejecutarCadaDosMinutos(CONFIG.FRIO_NAME);




