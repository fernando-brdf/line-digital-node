import * as mongoose from 'mongoose';

export interface Post extends mongoose.Document {
    titulo: String,
    conteudos: Conteudo[],
    propagandas: String[],
    palavras_chave: String[],
    comentarios: Comentario[],
    imagens: String[],
    link: String
}

export interface Conteudo extends mongoose.Document {
    titulo: String,
    texto: String
}

export interface Comentario extends mongoose.Document {
    username: String,
    texto: String,
    data: String
}

const conteudoSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: false,
        minlength: 3,
        maxlength: 100
    },
    texto: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 1000
    }
})

const comentarioSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20
    },
    texto: {
        type: String,
        required: true,
        maxlength: 350
    },
    data: {
        type: String,
        required: true //incompleto
    }
})


const postSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 60
    },
    conteudos: {
        type: [conteudoSchema],
        required: true
    },
    propagandas: {
        type: [String],
        required: true,
        minlength: 3,
        maxlength: 800
    },
    palavras_chave: {
        type: [String],
        required: true,
        minlength: 3,
        maxlength: 30
    },
    comentarios: {
        type: [comentarioSchema]
    },
    imagens: {
        type: [String],
        minlength: 3,
        maxlength: 120,
        default: [
            "https://picsum.photos/800/400",
            "https://picsum.photos/600/300",
            "https://picsum.photos/400/200"
        ]
    },
    link: {
        type: String,
        required: true,
        unique: true,
        minlength: 5,
        maxlength: 80
    }
})


export const Post = mongoose.model<Post>('Post', postSchema);