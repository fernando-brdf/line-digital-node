import * as mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { environment } from '../../common/environments';

export interface Usuario extends mongoose.Document {
    nome: String,
    sexo: String,
    dt_nascimento: String,
    username: String,
    email: String,
    senha: String,
    premium: Boolean,
    notificacao_email: Boolean
}

const usuarioSchema = new mongoose.Schema({
    nome: {
        type: String,
        minlength: 2,
        maxlength: 60,
        required: true
    },
    sexo: {
        type: String,
        enum: ['m', 'f', 'o', 'n'],
        required: true
    },
    dt_nascimento: {
        type: String,
        minlength: 6,
        maxlength: 50
    },
    username: {
        type: String,
        unique: true,
        minlength: 3,
        maxlength: 20
    },
    email: {
        type: String,
        unique: true,
        match: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        required: true
    },
    senha: {
        type: String,
        select: false,
        required: true,
        default: "senha123"
    },
    premium: {
        type: Boolean,
        default: false
    },
    notificacao_email: {
        type: Boolean,
        default: true
    }
});


//criptografa senha
const hashPassword = (obj: any, next: any) => {
    bcrypt.hash(obj.senha, environment.serguranca.saltRounds)
        .then(hash => {
            obj.senha = hash
            next();
        }).catch(() => { next })
};

//criptografa senhas quando os dados forem salvos
const saveMiddleware = function (next: any) {

    //@ts-ignore
    const user = this; 

    if (!user.isModified('senha')) {
        next();
    } else {
        hashPassword(user, next);
    }
};

usuarioSchema.pre('save', saveMiddleware);

export const Usuario = mongoose.model<Usuario>('Usuario', usuarioSchema);
