import * as mongoose from 'mongoose';
import express from 'express';

//classe de CRUD de documentos (genérico) para rotas
export abstract class ModelRouter<D extends mongoose.Document> {

    protected basePath: string;
    protected pageSize: number = 4;


    constructor(protected model: mongoose.Model<D>) {
        this.basePath = `/${model.collection.name}`
    }

    //aplicar rotas dentro do método implementado utilizando a variavel rota
    abstract aplRotas(rota: express.Router): any;


    //valida o id enviado como parametro da requisição
    validarId = (req: express.Request, res: express.Response) => {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400).send();
        } else {
            res.send();
        }
    }

    //traz todos os elementos do model por paginação
    //retorna array vazio caso de não documento
    //retorna erro 400 em caso de erro de execução
    buscarTodos = (req: express.Request, res: express.Response) => {
        let page: any = req.query._page || 1;
        page = page > 0 ? page : 1;

        const skip = (page - 1) * this.pageSize;

        this.model.find()
            .skip(skip)
            .limit(this.pageSize)
            .then(doc => { return res.json(doc) })
            .catch(() => { return res.sendStatus(400) });
    }

    //procura elemento pelo id
    //retorna array vazio caso de não documento
    //retorna erro 400 em caso de id inválido
    buscarPorId = (req: express.Request, res: express.Response) => {
        const { id } = req.params;

        if (id) {
            this.model.findById(id)
                .then(doc => {
                    if (!doc) { return res.json([]).send() }
                    return res.json(doc).send()
                })
                .catch(() => { return res.sendStatus(400) });
        } else {
            return res.sendStatus(400);
        }
    }

    //cria novo documento
    //retorna status 200 (OK)
    //retorna erro e status 400 caso não seja válido o documento
    criar = (req: express.Request, res: express.Response) => {
        let user = new this.model(req.body)
        user.save()
            .then(() => { return res.sendStatus(200).send() })
            .catch((e: Error) => { return res.status(400).json(e) });

    }

    //sobrescreve o documento
    //retorna documento atualizado
    //retorna array vazio em caso de nenhum documento encontrado
    //retorna erro 400 em caso de erro de execução
    sobrescrever = (req: express.Request, res: express.Response) => {
        const options = { runValidators: true, overwrite: true }; // ativar validador/sobrescreve completamente o documento (removendo oq nao for enviado)
        const { id } = req.params, querys = { "_id": id };

        if (id) {
            //@ts-ignore
            this.model.update(querys, req.body, options)
                .exec()
                //@ts-ignore
                .then((result: any) => {
                    if (result.n) { //verifica sucesso
                        return this.model.findById(req.params.id);
                    } else {
                        return [];
                    }
                }).then((doc: any) => { return res.json(doc) })
                .catch((e: Error) => { return res.sendStatus(404) });
        } else {
            return res.sendStatus(404);
        }
    }

    //altera atributos específicos do documento
    //retorna documento atualizado
    //retorna array vazio em caso de nenhum documento encontrado
    //retorna 400 e erro em caso de dados inválido para alteração
    atualizar = (req: express.Request, res: express.Response) => {
        const options = { new: true, runValidators: true, useFindAndModify: false }; //ativar valida / opção para retornar o novo usuário e ñ o antigo
        const { id } = req.params, body = req.body, querys = { _id: id };

        if (id) {
            //@ts-ignore
            this.model.findOneAndUpdate(querys, body, options)
                .then((doc: D) => {
                    if (!doc) { return res.json([]).send() }
                    return res.json(doc).send();
                })
                .catch((e: Error) => { return res.status(400).json(e) });
        } else {
            return res.sendStatus(400);
        }
    }

    //deleta documento pelo id 
    //Erro 404 em caso de nenhum documento encontrado
    deletar = (req: express.Request, res: express.Response) => {
        const { id } = req.params, querys = { _id: id };

        if (id) {
            //@ts-ignore
            this.model.deleteOne(querys)
                .exec()
                .then((result: any) => {
                    if (result.n) {
                        res.sendStatus(204);
                    } else {
                        throw new Error("Documento não encontrado");
                    }
                })
                .catch(() => { return res.sendStatus(404) });
        }
    }


    buscarPorIdModel = (id: String, selec: [String] = [""]) => {
        return this.model.findById(id).select(selec);
    }

    buscarTodosModel = (selec: [String] = [""], page: number, pageSize: number = this.pageSize) => {

        page = page > 0 ? page : 1;

        const skip: number = (page - 1) * pageSize;

        return this.model.find()
            .skip(skip)
            .limit(pageSize)
    }
}
