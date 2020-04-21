import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Lexema } from '../Objetos/lexema';
import { ErrorSintactico } from '../Objetos/errorSintactico';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


@Injectable()
export class sintactico {

    controlLista: number;
    actual: Lexema;
    error: number;
    errores: ErrorSintactico[];
    entrada: Lexema[];
    panico:boolean;                     //------PANICO SE ACTIVA AL ENCONTRAR ERROR Y SE DESACTIVA AL ENCONTRAR CARACTER CLAVE
    esperado:string[];
    diccionario:Lexema[];
    analizar(cadena: Lexema[]):ErrorSintactico[] {  
        this.errores=[];
        this.esperado=[];
        this.diccionario=[];      
        this.panico=false;
        this.entrada = cadena;
        this.controlLista = 0;
        this.error = 0;
        this.actual = this.entrada[this.controlLista];
        this.INICIO();

        return this.errores;
    }

    //--------------CABE LA MENCION QUE EN CONTENIDO E INSTRUCCIONES SON LOS UNICOS LUGARES DONDE SE COMPRUEBA
    //--------------ANTES DE ENVIAR A LA PRODUCCION Y DENTRO DE LA ENVIADA PARA PODER APLICAR LA RECURSIVIDAD :)
    INICIO() {
            this.emparejar("Reservada class");
            this.emparejar("Identificador");
            this.emparejar("Llaves abrir");
            this.CONTENIDO();
            this.emparejar("Llaves cerrar")
            this.emparejar("ULTIMO");
    }
    CONTENIDO(){
            if(this.actual.tipo.includes("Tipo")){
                this.DECISION_FUERA();
                this.CONTENIDO();
            }
            else if(this.actual.tipo=="Reservada void"){
                this.METODOS_VOID();
                this.CONTENIDO();
            }
            else if(this.actual.tipo=="Comentario abrir"){
                this.COMENTARIO_BLOQUE();
                this.CONTENIDO();
            }
            else if(this.actual.tipo=="Comentario"){
                this.COMENTARIO_SIMPLE();
                this.CONTENIDO();
            }
    }
    DECISION_FUERA(){
        var tipo=this.actual.info;
        this.emparejarSolo("Tipo");
        this.emparejar("Identificador");
        this.DA(tipo);
    }
    DA(tipo:string){
        if(this.actual.tipo=="Parentesis abrir"){
            this.emparejar("Parentesis abrir");
            this.PARAMETROS();
            this.emparejar("Llaves abrir");
            this.INSTRUCCIONES();
            this.emparejar("Reservada return");
            this.LOGICO();
            this.emparejarClave();
            this.TIPADO();
            this.emparejar("Llaves cerrar");
        }
        else{
            var aux:Lexema=this.entrada[this.controlLista-1];
            var temp:Lexema=new Lexema(tipo,aux.info,aux.fila,0)   
            this.diccionario.push(temp);
            this.LISTA(tipo);
            this.DECLARARP(tipo);
            this.emparejarClave();
        }
   
      
    }
    DECLARAR(){
        var tipo=this.actual.info;
        this.emparejarSolo("Tipo");
        this.CUERPO(tipo);
    }
    CUERPO(tipo:string){
        var aux:Lexema=new Lexema(tipo,this.actual.info,this.actual.fila,0)
        this.emparejar("Identificador"); this.diccionario.push(aux);
        this.LISTA(tipo);
        this.DECLARARP(tipo);
    }
    LISTA(tipo:string){
        if(this.actual.tipo=="Coma"){
            this.emparejar("Coma");
            var aux:Lexema=new Lexema(tipo,this.actual.info,this.actual.fila,0)
            this.emparejar("Identificador"); this.diccionario.push(aux);
            this.LISTA(tipo);
        }
    }
    DECLARARP(tipo:string){
        if(this.actual.tipo=="Igual"){
            this.emparejar("Igual");
            this.LOGICO();
            this.DECLARARPP(tipo);
        }
    }
    DECLARARPP(tipo:string){
        if(this.actual.tipo=="Coma"){
            this.emparejar("Coma");
            this.CUERPO(tipo);
        }
    }

    DECISION_DENTRO(){
                
                this.emparejar("Identificador");
                this.DD();
                //this.emparejarClave();
    }
    DD(){
        if(this.actual.tipo=="Parentesis abrir"){
                this.emparejar("Parentesis abrir");
                this.OP();
        }
        else if(this.actual.tipo=="Igual"){
                this.emparejar("Igual");
                this.LOGICO();
        }
        else{
            this.esperado.push("Igual");
            this.esperado.push("Parentesis abrir");
            this.emparejarVarios();
        }   
    }

    METODOS_VOID(){
                this.emparejar("Reservada void");
                this.VOID();
                this.emparejar("Llaves abrir");
                this.VOIDP();
                this.emparejar("Llaves cerrar");
    }
    VOID(){

         if(this.actual.tipo=="Identificador"){
            this.CUERPOMETODO();
         }   
         else if(this.actual.tipo=="Reservada main"){
             this.emparejar("Reservada main");
            this.emparejar("Parentesis abrir");
            this.emparejar("Parentesis cerrar");
         }
         else{
             this.esperado.push("Identificador");
             this.esperado.push("Reservada main")
             this.emparejarVarios();
         }
    }
    CUERPOMETODO(){
            this.emparejar("Identificador");
            this.emparejar("Parentesis abrir");
            this.PARAMETROS();
    }
    PARAMETROS(){

            if(this.actual.tipo=="Parentesis cerrar"){
                this.emparejar("Parentesis cerrar");
            }
            else if(this.actual.tipo.includes("Tipo")){ 
                this.P();
                this.PP();
                this.emparejar("Parentesis cerrar");
            }
            else{
                this.esperado.push("Parentesis cerrar");
                this.esperado.push("Tipo");
                this.emparejarVarios();
            }
    }
    P(){
            var tipo=this.actual.info;
            this.emparejarSolo("Tipo");
            var aux:Lexema=new Lexema(tipo,this.actual.info,this.actual.fila,0);
            this.emparejar("Identificador");this.diccionario.push(aux);
    }
    PP(){
            
        if(this.actual.tipo=="Coma"){
                this.emparejar("Coma");
                this.P();
                this.PP();
        }   
    }

    VOIDP(){
            this.INSTRUCCIONES();
            this.RETURN();
    }
    RETURN(){
         if(this.actual.tipo=="Reservada return"){
            this.emparejar("Reservada return");
            this.emparejarClave();
            this.VOIDP();
         }   
    }

    TIPADO(){
        this.INSTRUCCIONES();
        this.RETURNP();
    }
    RETURNP(){
     if(this.actual.tipo=="Reservada return"){
         this.emparejar("Reservada return");
         this.LOGICO();
         this.emparejarClave();
         this.TIPADO();
     }    
    }

    INSTRUCCIONES(){
            if(this.actual.tipo=="Comentario abrir"){
                this.COMENTARIO_BLOQUE();
                this.INSTRUCCIONES();
            }
            else if(this.actual.tipo=="Comentario"){
                this.COMENTARIO_SIMPLE();
                this.INSTRUCCIONES();
            }
            else if(this.actual.tipo.includes("Tipo")){
                this.DECLARAR();
                this.emparejarClave();
                this.INSTRUCCIONES();
            }
            else if(this.actual.tipo.includes("Identificador")){
                this.DECISION_DENTRO();
                this.emparejarClave();
                this.INSTRUCCIONES();
            }
            else if(this.actual.tipo=="Reservada if"){
                this.IF();
                this.INSTRUCCIONES();
            }
            else if(this.actual.tipo=="Reservada while"){
                this.WHILE();
                this.INSTRUCCIONES();
            }
            else if(this.actual.tipo=="Reservada for"){
                this.FOR();
                this.INSTRUCCIONES();
            }
            else if(this.actual.tipo=="Reservada switch"){
                this.SWITCH();
                this.INSTRUCCIONES();
            }
            else if(this.actual.tipo=="Reservada do"){
                this.DO();
                this.INSTRUCCIONES();
            }
            else if(this.actual.tipo=="Reservada console"){
                this.IMPRIMIR();
                this.INSTRUCCIONES();
            }
      
            
    }

    COMENTARIO_BLOQUE(){
         this.emparejar("Comentario abrir");
         this.emparejar("Comentario bloque");
         this.emparejar("Comentario cerrar");   

    }
    COMENTARIO_SIMPLE(){
           this.emparejar("Comentario");
           this.emparejar("Comentario simple"); 
    }
    IMPRIMIR(){
        this.emparejar("Reservada console");
        this.emparejar("Punto");
        this.emparejar("Reservada Write");
        this.emparejar("Parentesis abrir");
        this.SALIDA();
        this.emparejarClave();
    }
    SALIDA(){
        if(this.actual.tipo=="Parentesis cerrar"){
            this.emparejar("Parentesis cerrar");
        }
        else{
            this.LOGICO();
            this.emparejar("Parentesis cerrar");
        }
    }
    LOGICO(){
            this.L();
            this.LP();
    }
    L(){
         this.NOT();
         this.EXPRESION();
         this.LP();
    }
    NOT(){
        if(this.actual.tipo=="Admiracion"){
                this.emparejar("Admiracion");
                this.NOT();
         }
    }
    LP(){
         if(this.actual.tipo.includes("Logico")){
            this.emparejarSolo("Logico");
            this.L();
         }   
    }
    EXPRESION(){
            this.E();
            this.COMPARACION();
    }
    COMPARACION(){
         if(this.actual.tipo.includes("Operador")){
            this.emparejarSolo("Operador");
            this.E();
         }   
    }
    E(){
         this.T();
         this.EP();   
    }
    EP(){
         if(this.actual.tipo=="Mas"){
            this.emparejar("Mas");
            this.T();
            this.EP();
         }  
         else if (this.actual.tipo=="Guion"){
            this.emparejar("Guion");
            this.T();
            this.EP();
         }  
         else if(this.actual.tipo=="Incremento"){
            this.emparejar("Incremento");
            this.EPP();
         }
         else if(this.actual.tipo=="Decremento"){
            this.emparejar("Decremento");
            this.EPP();
         } 
    }
    EPP(){
         if(this.actual.tipo=="Mas"){
            this.emparejar("Mas");
            this.T();
            this.EP();
         }  
         else if (this.actual.tipo=="Guion"){
            this.emparejar("Guion");
            this.T();
            this.EP();
         } 
    }

    T(){
            this.NOT();
            this.F();
            this.TP();
    }
    TP(){
            if(this.actual.tipo=="Asterisco"){
                this.emparejar("Asterisco");
                this.F();
                this.TP();

            }
            else if(this.actual.tipo=="Diagonal"){
                this.emparejar("Diagonal");
                this.F();
                this.TP();
            }
    }

    F(){

         if(this.actual.tipo.includes("Dato")){
            this.emparejarSolo("Dato");
         }
         else if(this.actual.tipo=="Comilla simple"){
            this.emparejar("Comilla simple");
            this.emparejarSolo("Dato"); 
            this.emparejar("Comilla simple");
         }
         else if(this.actual.tipo=="Comilla doble"){
            this.emparejar("Comilla doble");
            this.emparejarSolo("Dato");
            this.emparejar("Comilla doble");
         }
         else if(this.actual.tipo=="Identificador"){
            this.emparejar("Identificador");
            this.O();
         }
         else if(this.actual.tipo=="Parentesis abrir"){
            this.emparejar("Parentesis abrir");
            this.LOGICO();
            this.emparejar("Parentesis cerrar");
         }
 
         else{
            this.esperado.push("Dato");
            this.esperado.push("Comilla simple");
            this.esperado.push("Comilla doble");
            this.esperado.push("Identificador");
            this.esperado.push("Parentesis abrir");
            this.emparejarVarios();
         }
     } 

    O(){
            if(this.actual.tipo=="Parentesis abrir"){
                this.emparejar("Parentesis abrir");
                this.OP();
            }   
    }
    OP(){
            if(this.actual.tipo=="Parentesis cerrar"){
                this.emparejar("Parentesis cerrar");
            }
            else{
                this.SECPARAMETROS();
                this.emparejar("Parentesis cerrar");
             }
    }
    SECPARAMETROS(){
         this.SP();
         this.SPP();   
    }
    SP(){
            this.LOGICO();
    }
    SPP(){
        if(this.actual.tipo=="Coma"){
            this.emparejar("Coma");
            this.SP();
            this.SPP();
        }
    }
    SWITCH(){
        this.emparejar("Reservada switch");
        this.emparejar("Parentesis abrir");
        this.LOGICO();
        this.emparejar("Parentesis cerrar");
        this.emparejar("Llaves abrir");
        this.CASE();
        this.emparejar("Llaves cerrar");
    }
    CASE(){
        if(this.actual.tipo=="Reservada case"){
            this.emparejar("Reservada case");
            this.LOGICO();
            this.emparejar("Dos puntos");
            this.BREAK();
            this.CASEP();
            this.DEFAULT();
        }
        else{
            this.DEFAULT();
        }

    }
    BREAK(){
        this.INSTRUCCIONES();
        this.BREAKP();
    }
    BREAKP(){
        if(this.actual.tipo=="Reservada break"){
            this.emparejar("Reservada break");
            this.emparejarClave();
            this.BREAK();
        }
        else if(this.actual.tipo=="Reservada return"){
            this.emparejar("Reservada return");
            //@ts-ignore
            if(this.actual.tipo!="Punto y coma"){
            this.LOGICO();
            }
            this.emparejarClave();
            this.BREAK();
        }
    }
    CASEP(){
        if(this.actual.tipo=="Reservada case"){
            this.emparejar("Reservada case");
            this.LOGICO();
            this.emparejar("Dos puntos");
            this.BREAK();
            this.CASEP();
        }
    }
    DEFAULT(){
        if(this.actual.tipo=="Reservada default"){
            this.emparejar("Reservada default");
            this.emparejar("Dos puntos");
            this.INSTRUCCIONES();
            this.emparejar("Reservada break");
            this.emparejarClave();
            this.BREAK();
        }
    }
    FOR(){
        this.emparejar("Reservada for");
        this.emparejar("Parentesis abrir");
        this.FORDEC();
        this.emparejarClave();
        this.LOGICO();
        this.emparejarClave();
        this.LOGICO();
        this.emparejar("Parentesis cerrar");
        this.emparejar("Llaves abrir");
        this.BUCLE();
        this.emparejar("Llaves cerrar");
    }
    FORDEC(){
        if(this.actual.tipo.includes("Tipo")){
            this.DECLARAR();  
        }
        else{
            this.DECISION_DENTRO();
        }
    }
    BUCLE(){
        this.INSTRUCCIONES();
        this.BUCLEP();
    }
    BUCLEP(){
        if(this.actual.tipo=="Reservada break"){
            this.emparejar("Reservada break");
            this.emparejarClave();
            this.BUCLE();
        }
        else if(this.actual.tipo=="Reservada continue"){
            this.emparejar("Reservada continue");
            this.emparejarClave();
            this.BUCLE();
        }
        else if(this.actual.tipo=="Reservada return"){
            this.emparejar("Reservada return");
            //@ts-ignore
            if(this.actual.tipo!="Punto y coma"){
            this.LOGICO();
            }
            this.emparejarClave();
            this.BUCLE();
        }
    }
    WHILE(){
        this.emparejar("Reservada while");
        this.emparejar("Parentesis abrir");
        this.LOGICO();
        this.emparejar("Parentesis cerrar");
        this.emparejar("Llaves abrir");
        this.BUCLE();
        this.emparejar("Llaves cerrar");
    }
    IF(){
        this.emparejar("Reservada if");
        this.emparejar("Parentesis abrir");
        this.LOGICO();
        this.emparejar("Parentesis cerrar");
        this.emparejar("Llaves abrir");
        this.CONDICIONAL();
        this.emparejar("Llaves cerrar");
        this.ELSE_IF();
    }
    ELSE_IF(){
        if(this.actual.tipo=="Reservada else"){
            this.emparejar("Reservada else");
            this.ELSE_IFP();
        }
    }
    ELSE_IFP(){
        if(this.actual.tipo=="Reservada if"){
            this.emparejar("Reservada if");
            this.emparejar("Parentesis abrir");
            this.LOGICO();
            this.emparejar("Parentesis cerrar");
            this.emparejar("Llaves abrir");
            this.CONDICIONAL();
            this.emparejar("Llaves cerrar");
            this.ELSE_IF();
        }
        else if(this.actual.tipo=="Llaves abrir"){
            this.emparejar("Llaves abrir");
            this.CONDICIONAL();
            this.emparejar("Llaves cerrar");
        }
        else{
            this.esperado.push("Llaves abrir");
            this.esperado.push("Parentesis abrir");
            this.emparejarVarios();
        }
    }
    CONDICIONAL(){
        this.INSTRUCCIONES();
        this.CONDICIONALP();
    }
    CONDICIONALP(){
        if(this.actual.tipo=="Reservada return"){
            this.emparejar("Reservada return");
            //@ts-ignore
            if(this.actual.tipo!="Punto y coma"){
            this.LOGICO();
            }
            this.emparejarClave();
            this.CONDICIONAL();
        }
    }
    DO(){
        this.emparejar("Reservada do");
        this.emparejar("Llaves abrir");
        this.BUCLE();
        this.emparejar("Llaves cerrar");
        this.emparejar("Reservada while");
        this.emparejar("Parentesis abrir");
        this.LOGICO();
        this.emparejar("Parentesis cerrar");
        this.emparejarClave();
    }


//------------------------------------------------------------------------------------//
//--------------------------VALIDACIONES Y RECUPERACIONES-----------------------------//
//------------------------------------------------------------------------------------//

//--------------AL ENCONTRAR ERROR, SALTAR A PUNTO Y COMA, SINO SE ENCICLA ESA ONDA
    emparejar(esperado: string) {
        if (!this.panico) {
            if (this.actual.tipo!=esperado) {
                this.error++;
                var mensaje = "Se encontró " + this.actual.tipo + ", se esperaba " + esperado;
                var instancia: ErrorSintactico = new ErrorSintactico(this.actual, this.actual.fila, this.actual.columna, mensaje);
                this.errores.push(instancia);
                this.panico=true;
                this.actual=new Lexema("MODO PANICO",this.actual.info,0,0,);
            }
            else{
                this.controlLista += 1;
                this.actual = this.entrada[this.controlLista];
            }
        }
      
    }
    emparejarClave() {
    
            if (this.actual.tipo!="Punto y coma"&&this.actual.tipo!="MODO PANICO") {
                var mensaje = "Se encontró " + this.actual.tipo + ", se esperaba Punto y coma";
                var instancia: ErrorSintactico = new ErrorSintactico(this.actual, this.actual.fila, this.actual.columna, mensaje);
                this.errores.push(instancia);
                this.panico=true;
                this.caracterClave();
            }
            else if(this.actual.tipo=="MODO PANICO"){
                this.caracterClave();
            }
            else{
                console.log("aca");
                this.controlLista += 1;
                this.actual = this.entrada[this.controlLista];
            }
    }
    emparejarSolo(esperado:string){
        if (!this.panico) {
            if (!this.actual.tipo.includes(esperado)) {
                this.error++;
                var mensaje = "Se encontró " + this.actual.tipo + ", se esperaba " + esperado;
                var instancia: ErrorSintactico = new ErrorSintactico(this.actual, this.actual.fila, this.actual.columna, mensaje);
                this.errores.push(instancia);
                this.panico=true;
                this.actual=new Lexema("MODO PANICO",this.actual.info,0,0,);
            }
            else{
                this.controlLista += 1;
                this.actual = this.entrada[this.controlLista];
            }
        }
    
    }
    emparejarVarios() {
        if (!this.panico) {
            var bandera=false;
            var concat="";
            for (let i = 0; i < this.esperado.length; i++) {
                const element = this.esperado[i];
                if(this.actual.tipo.includes(element)){
                    bandera=true;
                    break;
                }
                concat+=element+" o ";
            }
            if(!bandera){
                this.error++;
                var mensaje = "Se encontró " + this.actual.tipo + ", se esperaba " + concat+"...";
                var instancia: ErrorSintactico = new ErrorSintactico(this.actual, this.actual.fila, this.actual.columna, mensaje);
                this.errores.push(instancia);
                this.panico=true;
                this.actual=new Lexema("MODO PANICO",this.actual.info,0,0,);
            }
            else{
                this.controlLista += 1;
                this.actual = this.entrada[this.controlLista];
            }
            
        }
        this.esperado=[];
    }

    caracterClave(){
        while(this.actual.tipo!="ULTIMO"){
            if(this.actual.info!=";"){
                this.controlLista += 1;
                this.actual = this.entrada[this.controlLista];
            }
            
            else{
                this.controlLista += 1;
                this.actual = this.entrada[this.controlLista];
                this.panico=false;
                break;
            }
        }
    }
    recuperado():boolean{
        return this.panico;
    }
    listaVariables(){
        return this.diccionario; 
    }
 

}