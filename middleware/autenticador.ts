import express from 'express';
import * as jwt from 'jsonwebtoken';
import { environment } from '../common/environments';
import { Usuario } from '../src/usuario/usuario.model';


export const Autenticador = {

    //adicionar token de sessão a requisição
    reqToken(req: express.Request, res: express.Response, next: express.NextFunction) {
        req.body.token = this.gerarToken(req.body.id);
        next();
    },

    //gerar novo token da sessão
    gerarToken(id: Number): String {
        //token
        const token = jwt.sign({ id }, environment.serguranca.secret, {
            expiresIn: environment.token.tempo //24h
        });

        return token;
    },
    async autenticacao(req: express.Request, res: express.Response, next: express.NextFunction) {
        try {
            const id = _autentica(req, next);
            if (id !== "") {
                const usuario: any = await Usuario.findById(id);
                req.body._user = usuario;''
                
            }
            return next();
        } catch (e) {
            return next()
            /* return res.status(401).json({ 'error': e.message || 'Erro de autenticação.' }); */
        }
    }

}

//retorna o id do usuário autenticado ou gera um error, caso o token seja inválido
function _autentica(req: express.Request, next: express.NextFunction) {

    const token = req.headers.authorization;
    var _user;

    if (!token) return "";

    jwt.verify(token, environment.serguranca.secret, (e, user: any) => {
        if (e) throw new Error('Token inválido.');
        _user = user.id;
    });

    return _user;
}
