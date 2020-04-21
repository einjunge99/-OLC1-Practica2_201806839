export class Etiqueta{
    tipo: string;
    info: string;
    nombre:string;
    atributo:string;
    cerrar:boolean=true;

    constructor(tipo: string, info: string, nombre:string,atributo:string) {
        this.tipo = tipo;
        this.info = info;
        this.nombre=nombre;
        this.atributo=atributo;
    }
}