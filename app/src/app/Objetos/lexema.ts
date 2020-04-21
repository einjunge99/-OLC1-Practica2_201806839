export class Lexema {
    tipo: string;
    info: string;
    fila: number;
    columna: number;

    variable:boolean;
    valor: string;
    clase: string;
    mensaje:string;
    constructor(tipo: string, info: string, fila: number, columna: number) {
        this.tipo = tipo;
        this.info = info;
        this.fila = fila;
        this.columna = columna;
    }
}