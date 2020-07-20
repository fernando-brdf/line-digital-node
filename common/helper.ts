export class Helper {

    static dataHrAtual(): String {
        const dt: Date = new Date();
        return dt.toLocaleString();
    }

    static dataAtual(): String {
        const dt: Date = new Date();
        return dt.toLocaleString();
    }

    static hrAtual(): String {
        const dt: Date = new Date();
        return dt.toLocaleString();
    }


    static adicionarZero(dt: String): String {
        return (dt.length == 1 ? "0" + dt : dt)
    }
}