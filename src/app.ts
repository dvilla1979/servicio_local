import { CONFIG } from './config';
import {ejecutarCadaDosMinutos} from './controladores/tags.controladores';

console.log('Servidor Iniciado');

ejecutarCadaDosMinutos(CONFIG.FRIO_NAME);




