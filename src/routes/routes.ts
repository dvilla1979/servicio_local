import express from 'express';
import {readFile} from 'fs/promises'
import moment from 'moment';

const app = express();

async function readThisFile(filePath: any): Promise<any> {
    try {
      const data = await readFile(filePath);
      //console.log(data.toString());
      return data.toString();
    } catch (error) {
      //console.error("Got an error trying to read the file:" + error.message);
      return "No se pudo leer el archivo de log"
   }
  }

app.get('/log', (req, res) => {
        //console.log(moment().format("YYYY-MM-DD").toString())
        readThisFile(`./logs/log-${moment().format("YYYY-MM-DD").toString()}.log`).then((data) => {
          //  console.log(data);
            res.send(data);                
        });
})

export default app;