import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Lexema } from '../Objetos/lexema';



@Injectable()
export class lexico {
    

    registro: Lexema[] = [];

    //-------------CORRELATIVOS PARA UBICACION LEXEMAS----------------------//
    filaDato: number = 1;
    columnaDato: number = 0;
    auxiliar: number = 0;
    errores: number = 0;


    alfabeto = ['_', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'V', 'U', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'ñ', 'o', 'p', 'q', 'r', 's', 't', 'v', 'u', 'w', 'x', 'y', 'z'];
    numeros = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    espacios = [' ', '\r', '\t', '\n', '\b', '\f'];
    simbolos = ['{', '}', ':', ';', ',', '[', ']', '/', '*', '"', '(', ')', '.', '=', '+', '-', '\'', '<', '>', '!','|','&'];
    simbolosN = ['{', '}', ':', ';', ',', '[', ']', '/', '*', '"', '(', ')', '=', '+', '-', '\'', '<', '>', '!','|','&']; //---------no tiene punto?
    analizar(cadena: string): Lexema[] {


        var inicioEstado = 0;
        var estadoPrincipal = 0;
        var cadenaConcatenar;
        var token = "";
        this.registro = [];

        for (inicioEstado = 0; inicioEstado < cadena.length; inicioEstado++) {
            cadenaConcatenar = cadena[inicioEstado]

            if (this.auxiliar == inicioEstado) {
                this.columnaDato++;
            }

            if (this.auxiliar != inicioEstado) {
                this.auxiliar = inicioEstado;
            }

            //---------------------------------------------


            switch (estadoPrincipal) {
                case 0:

                    switch (cadenaConcatenar) {
                        case ' ':
                        case '\r':
                        case '\b':
                        case '\f':
                        case '\t':
                            estadoPrincipal = 0;
                            break;
                        case '\n':
                            this.filaDato++;
                            this.columnaDato = 0;
                            estadoPrincipal = 0;
                            break;

                        default:

                            if (this.alfabeto.includes(cadenaConcatenar)) {
                                token += cadenaConcatenar;
                                estadoPrincipal = 2;

                            }
                            else if (this.numeros.includes(cadenaConcatenar)) {
                                token += cadenaConcatenar;
                                estadoPrincipal = 3;
                            }

                            else if (this.simbolos.includes(cadenaConcatenar)) {

                                token += cadenaConcatenar;
                                estadoPrincipal = 1;

                            }
                            else{
                                token += cadenaConcatenar;
                                estadoPrincipal=6; 
                            }

                            break;
                    }
                    break;

                //-----------------------------ESTADO DE SIMBOLOS----------------------//

                case 1:
                    if (token == ("!")) {
                        if (cadenaConcatenar == ('=')) {
                            token += cadenaConcatenar;
                            this.tokenValidos(token);
                            estadoPrincipal = 0;
                            token = "";

                        }
                        else {
                            this.tokenValidos(token);
                            estadoPrincipal = 0;
                            token = "";
                            inicioEstado = inicioEstado - 1;
                        }

                    }
                    
                    else if (token == ("+")) {
                        if (cadenaConcatenar == ('+')) {
                            token += cadenaConcatenar;
                            this.tokenValidos(token);
                            estadoPrincipal = 0;
                            token = "";

                        }
                        else {
                            this.tokenValidos(token);
                            estadoPrincipal = 0;
                            token = "";
                            inicioEstado = inicioEstado - 1;
                        }

                    }
                    else if (token == ("|")) {
                        if (cadenaConcatenar == ('|')) {
                            token += cadenaConcatenar;
                            this.tokenValidos(token);
                            estadoPrincipal = 0;
                            token = "";

                        }
                        else {
                            this.tokenValidos(token);
                            estadoPrincipal = 0;
                            token = "";
                            inicioEstado = inicioEstado - 1;
                        }

                    }
                    else if (token == ("&")) {
                        if (cadenaConcatenar == ('&')) {
                            token += cadenaConcatenar;
                            this.tokenValidos(token);
                            estadoPrincipal = 0;
                            token = "";

                        }
                        else {
                            this.tokenValidos(token);
                            estadoPrincipal = 0;
                            token = "";
                            inicioEstado = inicioEstado - 1;
                        }

                    }
                    else if (token == ("<")) {
                        if (cadenaConcatenar == ('=')) {
                            token += cadenaConcatenar;
                            this.tokenValidos(token);
                            estadoPrincipal = 0;
                            token = "";

                        }
                        else {
                            this.tokenValidos(token);
                            estadoPrincipal = 0;
                            token = "";
                            inicioEstado = inicioEstado - 1;
                        }

                    }
                    else if (token == (">")) {
                        if (cadenaConcatenar == ('=')) {
                            token += cadenaConcatenar;
                            this.tokenValidos(token);
                            estadoPrincipal = 0;
                            token = "";

                        }
                        else {
                            this.tokenValidos(token);
                            estadoPrincipal = 0;
                            token = "";
                            inicioEstado = inicioEstado - 1;
                        }

                    }
                    else if (token == ("-")) {
                        if (cadenaConcatenar == ('-')) {
                            token += cadenaConcatenar;
                            this.tokenValidos(token);
                            estadoPrincipal = 0;
                            token = "";

                        }
                        else {
                            this.tokenValidos(token);
                            estadoPrincipal = 0;
                            token = "";
                            inicioEstado = inicioEstado - 1;
                        }

                    }
                    else if (token == ("=")) {
                        if (cadenaConcatenar==('=')) {
                            token += cadenaConcatenar;
                            this.tokenValidos(token);
                            estadoPrincipal = 0;
                            token = "";

                        }
                        else {
                            this.tokenValidos(token);
                            estadoPrincipal = 0;
                            token = "";
                            inicioEstado = inicioEstado - 1;
                        }
                    }
                    else if (token == ("/")) {
                        if (cadenaConcatenar==('/')) {
                            token += cadenaConcatenar;
                            this.tokenValidos(token);
                            estadoPrincipal = 7;
                            token = "";

                        }
                        else if (cadenaConcatenar==('*')) {
                            token += cadenaConcatenar;
                            this.tokenValidos(token);
                            estadoPrincipal = 9;
                            token = "";

                        }
                        else {
                            this.tokenValidos(token);
                            estadoPrincipal = 0;
                            token = "";
                            inicioEstado = inicioEstado - 1;
                        }
                    }

                    else {

                        this.tokenValidos(token);
                        if (token == ("\"")) {
                            estadoPrincipal = 4;
                            token = "";
                            token += cadenaConcatenar;
                            if (token == ("\"")) {
                                var instancia: Lexema = new Lexema("Dato cadena", "", this.filaDato, this.columnaDato);
                                this.registro.push(instancia);
                                token = "";
                                token += cadenaConcatenar;
                                this.tokenValidos(token);
                                token = "";
                                estadoPrincipal = 0;
                            }

                        }
                        else if (token == ("'")) {
                            estadoPrincipal = 8;
                            token = "";
                            token += cadenaConcatenar;
                            if (token == ("'")) {
                                var instancia: Lexema = new Lexema("Dato char", "\0", this.filaDato, this.columnaDato);
                                this.registro.push(instancia);
                                token = "";
                                token += cadenaConcatenar;
                                this.tokenValidos(token);
                                token = "";
                                estadoPrincipal = 0;
                            }

                        }
                        else {
                            token = "";
                            estadoPrincipal = 0;
                            inicioEstado = inicioEstado - 1;
                        }

                    }
                    break;

                //-----------------------------ESTADO IDENTIFICADORES----------------------//

                case 2:
                    if (this.espacios.includes(cadenaConcatenar) || this.simbolos.includes(cadenaConcatenar)) {
                        var instancia: Lexema = new Lexema("Identificador", token, this.filaDato, this.columnaDato);
                        this.registro.push(instancia); 
                        token = "";
                        estadoPrincipal = 0;
                        inicioEstado = inicioEstado - 1;
                    }
                    else if (this.alfabeto.includes(cadenaConcatenar)) {
                        token += cadenaConcatenar;
                    }
                    else if (this.numeros.includes(cadenaConcatenar)) {
                        token += cadenaConcatenar;
                        estadoPrincipal = 5;
                    }
                    else {
                        token += cadenaConcatenar;
                        estadoPrincipal = 6;
                    }
                    break;


                //-----------------------------ESTADO NUMEROS----------------------//

                case 3:
                    if (this.espacios.includes(cadenaConcatenar) || this.simbolosN.includes(cadenaConcatenar))  //--------se utiliza el simbolosN porque no incluye '.' (punto)
                    {
                        var instancia: Lexema = new Lexema("Dato numero", token, this.filaDato, this.columnaDato);
                        this.registro.push(instancia);
                        token = "";
                        estadoPrincipal = 0;
                        inicioEstado = inicioEstado - 1;
                    }
                    else if (this.numeros.includes(cadenaConcatenar)) {
                        token += cadenaConcatenar;
                    }
                    else if (cadenaConcatenar == ('.')) {
                        token += cadenaConcatenar;
                        estadoPrincipal = 10;
                    }
                    else {
                        token += cadenaConcatenar;
                        estadoPrincipal = 6;

                    }

                    break;




                //-----------------------------ESTADO CADENA----------------------//

                case 4:
                    if (cadenaConcatenar == ('"') || cadenaConcatenar == ('\n')) {
                        var instancia: Lexema = new Lexema("Dato cadena", token, this.filaDato, this.columnaDato);
                        this.registro.push(instancia);
                        token = "";
                        token += cadenaConcatenar;
                        this.tokenValidos(token);
                        token = "";
                        estadoPrincipal = 0;

                    }
                    else {
                        token += cadenaConcatenar;
                    }
                    break;


                //-----------------------------ESTADO TIPO CARACTER----------------------//

                case 8:
                    if (cadenaConcatenar == ('\'')) {

                        var instancia: Lexema = new Lexema("Dato char", token, this.filaDato, this.columnaDato);
                        this.registro.push(instancia);
                        token = "";
                        token += cadenaConcatenar;
                        this.tokenValidos(token);
                        token = "";
                        estadoPrincipal = 0;
                    }
                    else {
                        token += cadenaConcatenar;
                       // estadoPrincipal = 6;
                    }
                    break;

                //-----------------------------ESTADO COMENTARIO SIMPLE----------------------//

                case 7:
                    if (cadenaConcatenar == ('\n') || cadenaConcatenar == ('\r')) {
                        var instancia: Lexema = new Lexema("Comentario simple", token, this.filaDato, this.columnaDato);
                        this.registro.push(instancia);
                        token = "";
                        estadoPrincipal = 0;
                    }
                    else {
                        token += cadenaConcatenar;
                    }
                    break;

                //-----------------------------ESTADO COMENTARIO BLOQUE----------------------//

                case 9:
                    var substring = token.substring(Math.max(0, token.length - 2));
                    if (substring == ("*/")) {
                        token = token.slice(0, -1);
                        token = token.slice(0, -1);
                        var instancia: Lexema = new Lexema("Comentario bloque", token, this.filaDato, this.columnaDato);
                        this.registro.push(instancia);
                        token = "";
                        this.tokenValidos("*/");
                        estadoPrincipal = 0;
                    }
                    else if (inicioEstado + 1 ==cadena.length) {
                        var instancia: Lexema = new Lexema("Comentario bloque", token, this.filaDato, this.columnaDato);
                        this.registro.push(instancia);

                    }
                    else {
                        token += cadenaConcatenar;
                    }
                    break;



                //-----------------------------ESTADO DOUBLE----------------------//

                case 10:
                    if (this.espacios.includes(cadenaConcatenar) || this.simbolos.includes(cadenaConcatenar)) {
                        var instancia: Lexema = new Lexema("Dato double", token, this.filaDato, this.columnaDato);
                        this.registro.push(instancia);
                        token = "";
                        estadoPrincipal = 0;
                        inicioEstado = inicioEstado - 1;
                    }
                    else if (this.numeros.includes(cadenaConcatenar)) {
                        token += cadenaConcatenar;
                    }

                    else {
                        token += cadenaConcatenar;
                        estadoPrincipal = 6;

                    }
                    break;


                //-----------------------------ESTADO DE ID----------------------//

                case 5:
                    if (this.espacios.includes(cadenaConcatenar) || this.simbolos.includes(cadenaConcatenar)) {
                        var instancia: Lexema = new Lexema("Identificador", token, this.filaDato, this.columnaDato);
                        this.registro.push(instancia);
                        token = "";
                        estadoPrincipal = 0;
                        inicioEstado = inicioEstado - 1;
                    }
                    else if (this.alfabeto.includes(cadenaConcatenar) || this.numeros.includes(cadenaConcatenar)) {
                        token += cadenaConcatenar;
                    }
                    else {
                        token += cadenaConcatenar;
                        estadoPrincipal = 6;
                    }
                    break;

                //-----------------------------ESTADO DE ERROR----------------------//

                case 6:

                    if (this.espacios.includes(cadenaConcatenar) || cadenaConcatenar == (';')) {
                        this.errores++;
                        var instancia: Lexema = new Lexema("error", token, this.filaDato, this.columnaDato);
                        this.registro.push(instancia);
                        token = "";
                        estadoPrincipal = 0;
                        inicioEstado = inicioEstado - 1;
                    }
                    else {
                        token += cadenaConcatenar;
                    }
                    break;
            }

            this.auxiliar++;

            //--------------------------------------------------

        }
        this.setReservadas();
        return this.registro;


    }


    tokenValidos(entrada: string) {
        switch (entrada) {
            case "{":
                var instancia: Lexema = new Lexema("Llaves abrir", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case "}":
                var instancia: Lexema = new Lexema("Llaves cerrar", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case "[":
                var instancia: Lexema = new Lexema("Corchete abrir", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case "]":
                var instancia: Lexema = new Lexema("Corchete cerrar", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case ":":
                var instancia: Lexema = new Lexema("Dos puntos", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case ";":
                var instancia: Lexema = new Lexema("Punto y coma", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case ",":
                var instancia: Lexema = new Lexema("Coma", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case "\"":
                var instancia: Lexema = new Lexema("Comilla doble", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case "\'":
                var instancia: Lexema = new Lexema("Comilla simple", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case "(":
                var instancia: Lexema = new Lexema("Parentesis abrir", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case ")":
                var instancia: Lexema = new Lexema("Parentesis cerrar", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case "*":
                var instancia: Lexema = new Lexema("Asterisco", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case "/":
                var instancia: Lexema = new Lexema("Diagonal", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case ".":
                var instancia: Lexema = new Lexema("Punto", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case "-":
                var instancia: Lexema = new Lexema("Guion", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case "=":
                var instancia: Lexema = new Lexema("Igual", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case "+":
                var instancia: Lexema = new Lexema("Mas", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case "|":
                 var instancia: Lexema = new Lexema("Barra", entrada, this.filaDato, this.columnaDato);
                  this.registro.push(instancia);
                  break;
            case "||":
                 var instancia: Lexema = new Lexema("Logico or", entrada, this.filaDato, this.columnaDato);
                 this.registro.push(instancia);
                 break;
            case "&":
                 var instancia: Lexema = new Lexema("Ampersand", entrada, this.filaDato, this.columnaDato);
                 this.registro.push(instancia);
                 break;
            case "&&":
                var instancia: Lexema = new Lexema("Logico and", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case "<":
                var instancia: Lexema = new Lexema("Operador menor", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case ">":
                var instancia: Lexema = new Lexema("Operador mayor", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case "!":
                var instancia: Lexema = new Lexema("Admiracion", entrada, this.filaDato, this.columnaDato);//------CAMBIARLO POR NOT
                this.registro.push(instancia);
                break;
            case "!=":
                var instancia: Lexema = new Lexema("Operador no igual", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case "==":
                var instancia: Lexema = new Lexema("Operador igual", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case "<=":
                var instancia: Lexema = new Lexema("Operador menor igual", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case ">=":
                var instancia: Lexema = new Lexema("Operador mayor igual", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case "//":
                var instancia: Lexema = new Lexema("Comentario", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case "/*":
                var instancia: Lexema = new Lexema("Comentario abrir", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case "*/":
                var instancia: Lexema = new Lexema("Comentario cerrar", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case "++":
                var instancia: Lexema = new Lexema("Incremento", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            case "--":
                var instancia: Lexema = new Lexema("Decremento", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;
            default:
                this.errores++;
                var instancia: Lexema = new Lexema("error", entrada, this.filaDato, this.columnaDato);
                this.registro.push(instancia);
                break;    

        }

    }

    setReservadas() {
        this.registro.forEach(element => {
            if (element.tipo == ("Identificador")) {
                var entrada = element.info;
                switch (entrada) {

                    case "return":
                        element.tipo="Reservada return";
                        break;
                    case "class":
                        element.tipo = "Reservada class";
                        break;
                    case "main":
                        element.tipo = "Reservada main";
                            break;
                    case "void":
                        element.tipo = "Reservada void"; //-----cambiarlo a Retorno void
                        break;
                    case "double":
                        element.tipo = "Tipo double";
                    break;
                    case "string":
                        element.tipo = "Tipo string";
                        break;
                    case "String":
                        element.tipo = "Tipo String";
                        break;
                    case "int":
                        element.tipo = "Tipo int";
                        break;
                    case "float":
                        element.tipo = "Tipo float";
                        break;
                    case "char":
                        element.tipo = "Tipo char";
                        break;
                    case "bool":
                        element.tipo = "Tipo bool";
                        break;
                    case "Console":
                        element.tipo = "Reservada console";
                        break;
                    case "continue":
                          element.tipo = "Reservada continue";
                        break;
                    case "do":
                            element.tipo = "Reservada do";
                          break;
                    case "WriteLine":
                        element.tipo = "Reservada WriteLine";
                        break;
                    case "Write":
                        element.tipo = "Reservada Write";
                        break;
                    case "new":
                        element.tipo = "Reservada new";
                        break;
                    case "if":
                        element.tipo = "Reservada if";
                        break;
                    case "else":
                        element.tipo = "Reservada else";
                        break;
                    case "case":
                        element.tipo = "Reservada case";
                        break;
                    case "switch":
                        element.tipo = "Reservada switch";
                        break;
                    case "default":
                        element.tipo = "Reservada default";
                        break;
                    case "break":
                        element.tipo = "Reservada break";
                        break;
                    case "for":
                        element.tipo = "Reservada for";
                        break;
                    case "while":
                        element.tipo = "Reservada while";
                        break;
                    case "true":
                        element.tipo = "Dato bool";
                        break;
                    case "false":
                        element.tipo = "Dato bool";
                        break;
                        default:
        
                            break;

                }

            }
        });
    }
    returnErrores(){
        return this.errores;
    }
}