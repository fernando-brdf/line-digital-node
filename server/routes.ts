import express from 'express';
import { postRoutes } from '../src/post/post.routes'
import { usuarioRoutes } from '../src/usuario/usuario.routes'

class Routes {

    public routes: express.Router = express.Router();

    constructor() {
        postRoutes.aplRotas(this.routes);
        usuarioRoutes.aplRotas(this.routes);
    }
}

export const allRoutes = new Routes();
