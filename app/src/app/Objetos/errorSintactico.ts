import { Lexema } from './lexema';

export class ErrorSintactico {
    info: Lexema;
    fila: number;
    columna: number;
    mensaje:string;
    constructor(info: Lexema, fila: number, columna: number,mensaje:string) {
        this.info = info;
        this.fila = fila;
        this.columna = columna;
        this.mensaje=mensaje;
    }
}