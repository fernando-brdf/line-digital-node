import { Usuario } from "./usuario.model";
import { ModelRouter } from "../../server/model-routes";
import express from 'express';
import bcrypt from 'bcrypt';
import { Autenticador } from '../../middleware/autenticador';

class UsuarioRoutes extends ModelRouter<Usuario>{

    constructor() {
        super(Usuario);
    }

    aplRotas(rota: express.Router): any {
        this.basePath = "/usuarios";

        rota.post(this.basePath, this.criar);
        rota.post(this.basePath + "/login", this.login);
    } 

    login = (req: express.Request, res: express.Response) => {
        const { email, senha } = req.body;

        this.model.findOne({ email })
            .select('+senha')
            .then(async doc => {

                if (!doc) throw new Error("E-mail não encontrado.");

                if (await bcrypt.compare(senha, doc.senha.toString())) {

                    const token = Autenticador.gerarToken(doc.id);
                    const _usuario = {
                        "nome": doc.get('nome'),
                        "email": doc.get('email'),
                        "id": doc.get('_id')
                    };

                    res.send({ _usuario, token });

                } else {
                    throw new Error("Usuário ou senha incorreta.");
                }
            })
            .catch((e: Error) => { res.status(400).json({ 'error': e.message }) });
    }
}

export const usuarioRoutes = new UsuarioRoutes();