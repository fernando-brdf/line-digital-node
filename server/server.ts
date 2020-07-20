import { environment as gl } from '../common/environments';

import express from 'express';
import cors from 'cors';
import { allRoutes } from './routes';
import mongoose from 'mongoose';
import { Helper } from '../common/helper'; 

export class Server {

    constructor() {
        this.inicializarDB()
            .then(() => this.configServer())
            .catch(() => console.log("Banco não incializado"));
    }

    //configurações e inicialização do servidor
    private configServer() {

        const app: express.Application = express();

        app.use(cors());
        app.use(express.json());
        app.use(allRoutes.routes); //rotas

        app.listen(gl.server.port, () => {
            console.log("App iniciado na porta: " + gl.server.port + " às " + Helper.dataHrAtual());
        });
    }

    //Inicializa o mongo DB
    private inicializarDB(): Promise<typeof mongoose> {
        (<any>mongoose).Promise = global.Promise;

        mongoose.set('useCreateIndex', true);
        return mongoose.connect(
            gl.db.url,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            });
    }

}