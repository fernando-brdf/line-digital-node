import { ModelRouter } from '../../server/model-routes';
import { Post } from './post.model';
import express from 'express';
import { environment } from '../../common/environments';
import { Autenticador } from '../../middleware/autenticador';

class PostRoutes extends ModelRouter<Post>{

    constructor() {
        super(Post);
    }

    aplRotas(rota: express.Router) {
        this.basePath = "/posts";

        rota.get(this.basePath, Autenticador.autenticacao, this.buscarTodosPost, this.enviarResponse);
        rota.get(this.basePath + "/:titulo", Autenticador.autenticacao, this.buscarPost, this.enviarResponse);
        rota.post(this.basePath, this.autenticarMaster, this.criar)
        rota.delete(this.basePath + "/:id", this.autenticarMaster, this.deletar)
        rota.patch(this.basePath + "/:id", this.autenticarMaster, this.atualizar)
    }

    autenticarMaster = (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const { _tokenMaster } = req.body;

        if (!_tokenMaster || String(_tokenMaster) !== String(environment.master.token)) {
            return res.status(400).json({ error: "Não autorizado!" });
        }
        return next();
    }

    buscarPost = async (req: express.Request, res: express.Response, next: express.NextFunction) => {

        let link = req.params.titulo;
        link = link.toLowerCase();

        const contador: any = await this.model.countDocuments((e: any, c: any) => {
            if (e) return res.status(400).send();
        });

        const skip = Math.floor(Math.random() * (contador - 1)),
            limitador = 2;

        this.model.find()
            .skip(skip)
            .limit(limitador)
            .select(['titulo', 'imagens', 'conteudos.texto', 'link'])
            .then((relacionados: any) => {

                this.model.findOne({ link })
                    .then((doc: any) => {
                        if (!doc) throw new Error("");

                        var novoDoc = JSON.parse(JSON.stringify(doc));
                        novoDoc.relacionados = relacionados;

                        req.body._doc = novoDoc;
                        return next();
                    })
                    .catch(() => res.status(400).send());
            }).catch((err) => {
                return res.status(400).send();
            });

    }

    buscarTodosPost = (req: express.Request, res: express.Response, next: express.NextFunction) => {

        let page: any = req.query._page || 1;
        const buscar: any = String(req.query.buscar).replace(/"/g, "");

        page = page > 0 ? page : 1;

        const skip = (page - 1) * this.pageSize;
        const option: any = 'i';

        this.model.find({ titulo: { $regex: buscar, $options: option } })
            .skip(skip)
            .limit(this.pageSize)
            .then(doc => {
                req.body._doc = doc;
                return next();
            })
            .catch(() => { return res.sendStatus(400) });
    }

    enviarResponse = async (req: express.Request, res: express.Response) => {

        try {
            const { _user, _doc } = await req.body;

            if (_user)
                return res.json({ doc: _doc, usuario: _user });
            return res.json({ doc: _doc });

        } catch (e) {
            return res.sendStatus(400);
        }
    }


}

export const postRoutes = new PostRoutes();