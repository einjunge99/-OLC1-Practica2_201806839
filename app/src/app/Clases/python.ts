import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Lexema } from '../Objetos/lexema';
import { Etiqueta } from '../Objetos/etiquetas';

import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { sep } from 'path';


@Injectable()
export class python {

    controlLista: number;
    actual: Lexema;
    entrada: Lexema[];        
    traduccion:string="";  
    activo:number=0;   
    espacios:number=0; 
    linea:number=0;  
    main:boolean;
    html:Etiqueta[];
    
    auxiliar:string="";
    cont:number=0;
    
    contSwitch:number; //-----------util para switch anidados
   
    banderaFor:boolean;
    banderaAuxiliar:boolean;
    operadorFor:boolean;

    auxiliarFor:string;
    auxiliarIdentificador:string;


    analizar(cadena: Lexema[]) {  
        this.contSwitch=0;
        this.banderaFor=false;
        this.html=[];
        this.main=false;
        this.entrada = cadena;
        this.controlLista = 0;
        this.actual = this.entrada[this.controlLista];
        this.INICIO();

        return this.traduccion;
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
        this.emparejarSolo("Tipo");
        this.emparejar("Identificador");
        this.DA();
    }
    DA(){
        if(this.actual.tipo=="Parentesis abrir"){
            this.agregarTraduccion("def ");
            this.agregarTraduccion(this.entrada[this.controlLista-1].info); //-----agrego el ultimo id
            this.emparejar("Parentesis abrir"); this.agregarTraduccion("(");
            this.PARAMETROS();
            this.emparejar("Llaves abrir"); this.agregarTraduccion(":");this.espacios++; this.agregarTraduccion("\n");
            this.INSTRUCCIONES();
            this.emparejar("Reservada return"); this.agregarTraduccion("return ");
            this.LOGICO(); this.agregarTraduccion("\n");
            this.emparejarClave();
            this.TIPADO();
            this.emparejar("Llaves cerrar"); this.espacios--;
        }
        else {
            this.LISTA();
            this.DECLARARP();
            this.emparejarClave();
        }
   
      
    }
    DECLARAR(){
        this.emparejarSolo("Tipo");
        this.CUERPO();
    }
    CUERPO(){
        this.emparejar("Identificador");
        this.LISTA();
        this.DECLARARP();
    }
    LISTA(){
        if(this.actual.tipo=="Coma"){
            this.emparejar("Coma");
            this.emparejar("Identificador");
            this.LISTA();
        }
    }
    DECLARARP(){
        if(this.actual.tipo=="Igual"){
            this.agregarTraduccion("var ");
            var id=this.entrada[this.controlLista-1].info;
            this.agregarTraduccion(id);this.auxiliarIdentificador=id;
            this.emparejar("Igual");this.agregarTraduccion("=");
            this.LOGICO();
            this.agregarTraduccion("\n");
            this.DECLARARPP();
        }
    }
    DECLARARPP(){
        if(this.actual.tipo=="Coma"){
            this.emparejar("Coma");
            this.CUERPO();
        }
    }

    DECISION_DENTRO(){
                this.auxiliarIdentificador=this.actual.info;
                this.emparejar("Identificador");
                this.DD();
                //this.emparejarClave();
    }
    DD(){
        if(this.actual.tipo=="Parentesis abrir"){
            this.agregarTraduccion("def ");
            this.agregarTraduccion(this.entrada[this.controlLista-1].info); //-----agrego el ultimo id
                this.emparejar("Parentesis abrir"); this.agregarTraduccion("(");
                this.OP();
                this.agregarTraduccion("\n");
        }
        else if(this.actual.tipo=="Igual"){
                this.agregarTraduccion(this.entrada[this.controlLista-1].info); //-----agrego el ultimo id
                this.emparejar("Igual");this.agregarTraduccion("=");
                this.LOGICO();
                this.agregarTraduccion("\n");
        }

    }

    METODOS_VOID(){
                this.emparejar("Reservada void"); this.agregarTraduccion("def ");
                this.VOID();
                this.emparejar("Llaves abrir"); this.agregarTraduccion(":"); this.espacios++;this.agregarTraduccion("\n");
                this.VOIDP();
                this.emparejar("Llaves cerrar"); this.espacios--;
                if(this.main){
                    this.main=false;
                    this.agregarTraduccion("if_name_=\"_main_\":");this.agregarTraduccion("\n");
                    this.espacios++;
                    this.agregarTraduccion("main()");this.agregarTraduccion("\n");
                    this.espacios--;
                }
    }
    VOID(){

         if(this.actual.tipo=="Identificador"){
            this.CUERPOMETODO();
         }   
         else if(this.actual.tipo=="Reservada main"){
            this.main=true;
            this.emparejar("Reservada main"); this.agregarTraduccion("main");
            this.emparejar("Parentesis abrir"); this.agregarTraduccion("(");
            this.emparejar("Parentesis cerrar"); this.agregarTraduccion(")");
         }

    }
    CUERPOMETODO(){
            this.agregarTraduccion(this.actual.info);
            this.emparejar("Identificador");
            this.emparejar("Parentesis abrir");this.agregarTraduccion("(");
            this.PARAMETROS();
    }
    PARAMETROS(){

            if(this.actual.tipo=="Parentesis cerrar"){
                this.emparejar("Parentesis cerrar"); this.agregarTraduccion(")")
            }
            else if(this.actual.tipo.includes("Tipo")){ 
                this.P();
                this.PP();
                this.emparejar("Parentesis cerrar"); this.agregarTraduccion(")")
            }
    }
    P(){
            this.emparejarSolo("Tipo");
            this.agregarTraduccion(this.actual.info);
            this.emparejar("Identificador"); 
    }
    PP(){
            
        if(this.actual.tipo=="Coma"){
                this.emparejar("Coma"); this.agregarTraduccion(",")
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
            this.emparejar("Reservada return"); this.agregarTraduccion("return")
            this.emparejarClave(); this.agregarTraduccion("\n");
            this.VOIDP();
         }   
    }

    TIPADO(){
        this.INSTRUCCIONES();
        this.RETURNP();
    }
    RETURNP(){
     if(this.actual.tipo=="Reservada return"){
         this.emparejar("Reservada return"); this.agregarTraduccion("return ")
         this.LOGICO(); this.agregarTraduccion("\n");
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

         this.emparejar("Comentario abrir");this.agregarTraduccion("'''");
         this.agregarTraduccion("\n");
         var resultado=[];
         resultado=this.actual.info.split("\n");
         resultado.forEach(element => {
             if(!this.caracteresIguales(element)){
                this.agregarTraduccion(element);
                this.agregarTraduccion("\n");
             }
             else{
                 this.agregarTraduccion("\n");
             }
         });
         this.emparejar("Comentario bloque");
         this.emparejar("Comentario cerrar");this.agregarTraduccion("'''");
         this.agregarTraduccion("\n");

    }
    COMENTARIO_SIMPLE(){
        this.agregarTraduccion("#");
        this.emparejar("Comentario");this.agregarTraduccion(this.actual.info);
        this.emparejar("Comentario simple"); this.agregarTraduccion("\n");
    }
    IMPRIMIR(){
        this.emparejar("Reservada console");this.agregarTraduccion("print");
        this.emparejar("Punto");
        this.emparejar("Reservada Write");
        this.emparejar("Parentesis abrir");this.agregarTraduccion("(");
        this.SALIDA();
        this.emparejarClave(); this.agregarTraduccion("\n");
    }
    SALIDA(){
        if(this.actual.tipo=="Parentesis cerrar"){
            this.emparejar("Parentesis cerrar");this.agregarTraduccion(")");
        }
        else{
            this.LOGICO();
            this.emparejar("Parentesis cerrar");this.agregarTraduccion(")");
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
                this.emparejar("Admiracion"); this.agregarTraduccion("not ");
                this.NOT();
         }
    }
    LP(){
         if(this.actual.tipo.includes("Logico")){
            if(this.actual.info=="&&"){
            this.agregarTraduccion("and ");
            }
            else{
            this.agregarTraduccion("or ");
            }
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
            this.agregarTraduccion(this.actual.info);
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
            this.emparejar("Mas");this.agregarTraduccion("+");
            this.T();
            this.EP();
         }  
         else if (this.actual.tipo=="Guion"){
            this.emparejar("Guion");this.agregarTraduccion("-");
            this.T();
            this.EP();
         }  
         else if(this.actual.tipo=="Incremento"){
            this.operadorFor=true;
            this.emparejar("Incremento");
            this.EPP();
         }
         else if(this.actual.tipo=="Decremento"){
            this.operadorFor=false;
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
                this.emparejar("Asterisco");this.agregarTraduccion("*");
                this.F();
                this.TP();

            }
            else if(this.actual.tipo=="Diagonal"){
                this.emparejar("Diagonal");this.agregarTraduccion("/");
                this.F();
                this.TP();
            }
    }

    F(){
    
         if(this.actual.tipo.includes("Dato")){
            this.auxiliarFor=this.actual.info;
            this.agregarTraduccion(this.actual.info); 
            this.emparejarSolo("Dato");
         }
         else if(this.actual.tipo=="Comilla simple"){
            
            this.emparejar("Comilla simple"); this.agregarTraduccion("\'");
            this.agregarTraduccion(this.actual.info);
            this.agregarHTML(this.actual.info);
            this.emparejarSolo("Dato");
            this.emparejar("Comilla simple");this.agregarTraduccion("\'");
         }
         else if(this.actual.tipo=="Comilla doble"){
            this.emparejar("Comilla doble");this.agregarTraduccion("\"");
            this.agregarTraduccion(this.actual.info); 
            this.emparejarSolo("Dato");
            this.emparejar("Comilla doble");this.agregarTraduccion("\"");
         }
         else if(this.actual.tipo=="Identificador"){
            this.agregarTraduccion(this.actual.info); 
            this.emparejar("Identificador");
            this.O();
         }
         else if(this.actual.tipo=="Parentesis abrir"){
            this.emparejar("Parentesis abrir");this.agregarTraduccion("(");
            this.EXPRESION();
            this.emparejar("Parentesis cerrar");this.agregarTraduccion(")");
         }
     } 

    O(){
            if(this.actual.tipo=="Parentesis abrir"){
                this.emparejar("Parentesis abrir");this.agregarTraduccion("(");
                this.OP();
            }   
    }
    OP(){
            if(this.actual.tipo=="Parentesis cerrar"){
                this.emparejar("Parentesis cerrar");this.agregarTraduccion(")");
            }
            else{
                this.SECPARAMETROS();
                this.emparejar("Parentesis cerrar");this.agregarTraduccion(")");
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
            this.emparejar("Coma"); this.agregarTraduccion(",");
            this.SP();
            this.SPP();
        }
    }
    //----------hacer una bandera para que mientras este detro del switch no se apliquen los \n
    SWITCH(){
        this.emparejar("Reservada switch"); this.agregarTraduccion("def switch");
        this.emparejar("Parentesis abrir");this.agregarTraduccion("(case,");
        this.LOGICO();
        this.emparejar("Parentesis cerrar");this.agregarTraduccion("):");
        this.espacios++;this.agregarTraduccion("\n");this.agregarTraduccion("switcher = ");
        this.emparejar("Llaves abrir");this.agregarTraduccion("{");this.espacios++;this.agregarTraduccion("\n");
        this.CASE();
        this.emparejar("Llaves cerrar");this.espacios--;this.agregarTraduccion("}");
        this.espacios--;this.agregarTraduccion("\n");

        this.cont=0;
    }
    CASE(){
        if(this.actual.tipo=="Reservada case"){
            this.contSwitch++;
            this.cont++;
            this.emparejar("Reservada case");
            this.LOGICO();
            this.emparejar("Dos puntos");this.agregarTraduccion(": ");
            this.BREAK();
            this.contSwitch--; this.agregarTraduccion("\n");
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
            this.emparejar("Reservada return");this.agregarTraduccion("return ")
            //@ts-ignore
            if(this.actual.tipo!="Punto y coma"){
            this.LOGICO();
            }
            this.emparejarClave();
            this.agregarTraduccion("\n");
            this.BREAK();
        }
    }
    CASEP(){
        if(this.actual.tipo=="Reservada case"){
            this.contSwitch++;
            this.cont++;
            this.emparejar("Reservada case");
            this.LOGICO();
            this.emparejar("Dos puntos");this.agregarTraduccion(": ")
            this.BREAK();
            this.contSwitch--;
            this.agregarTraduccion("\n");
            this.CASEP();
        }
    }
    DEFAULT(){
        if(this.actual.tipo=="Reservada default"){
            this.contSwitch++;
            this.cont++;
            this.emparejar("Reservada default");this.agregarTraduccion(this.cont.toString()+": ");
            this.emparejar("Dos puntos");
            this.INSTRUCCIONES();
            this.emparejar("Reservada break");
            this.emparejarClave();
            this.BREAK();
            this.contSwitch--;
            this.agregarTraduccion("\n");
        }
    }
    FOR(){
        this.emparejar("Reservada for");this.agregarTraduccion("for ");
        this.emparejar("Parentesis abrir");
        this.banderaFor=true;
        this.FORDEC();
        this.banderaFor=false;
        this.emparejarClave(); this.agregarTraduccion(this.auxiliarIdentificador+" in range (");
        this.agregarTraduccion(this.auxiliarFor);
        this.banderaFor=true;
        this.LOGICO();
        this.banderaFor=false;
        this.emparejarClave(); this.agregarTraduccion(",");
        this.agregarTraduccion(this.auxiliarFor);
        this.banderaFor=true;
        this.LOGICO();
        this.banderaFor=false;
        if(!this.operadorFor){
            this.agregarTraduccion(",-1");
        }
        this.emparejar("Parentesis cerrar");this.agregarTraduccion("):");
        this.emparejar("Llaves abrir");this.espacios++;this.agregarTraduccion("\n");
        this.BUCLE();
        this.emparejar("Llaves cerrar");this.espacios--;this.agregarTraduccion("\n");
        this.banderaFor=false;
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
            this.emparejar("Reservada return");this.agregarTraduccion("return ");
            //@ts-ignore
            if(this.actual.tipo!="Punto y coma"){
            this.LOGICO();
            }
            this.emparejarClave();
            this.agregarTraduccion("\n");
            this.BUCLE();
        }
   
    }
    WHILE(){
        this.emparejar("Reservada while");this.agregarTraduccion("while");
        this.emparejar("Parentesis abrir");
        this.LOGICO();
        this.emparejar("Parentesis cerrar");
        this.emparejar("Llaves abrir");this.agregarTraduccion(":"); this.espacios++;this.agregarTraduccion("\n");
        this.BUCLE();
        this.emparejar("Llaves cerrar");this.espacios--;
    }
    IF(){
        this.emparejar("Reservada if"); this.agregarTraduccion("if ");
        this.emparejar("Parentesis abrir");
        this.LOGICO();
        this.emparejar("Parentesis cerrar");
        this.emparejar("Llaves abrir"); this.agregarTraduccion(":"); this.espacios++;this.agregarTraduccion("\n");
        this.CONDICIONAL();
        this.emparejar("Llaves cerrar");this.espacios--;
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
            this.emparejar("Reservada if"); this.agregarTraduccion("elif ")
            this.emparejar("Parentesis abrir");
            this.LOGICO();
            this.emparejar("Parentesis cerrar");
            this.emparejar("Llaves abrir");this.agregarTraduccion(":");this.espacios++;this.agregarTraduccion("\n");
            this.CONDICIONAL();
            this.emparejar("Llaves cerrar");this.espacios--;
            this.ELSE_IF();
        }
        else if(this.actual.tipo=="Llaves abrir"){
            this.agregarTraduccion("else");
            this.emparejar("Llaves abrir");this.agregarTraduccion(":");this.espacios++;this.agregarTraduccion("\n");
            this.CONDICIONAL();
            this.emparejar("Llaves cerrar");this.espacios--;
        }

    }
    CONDICIONAL(){
        this.INSTRUCCIONES();
        this.CONDICIONALP();
    }
    CONDICIONALP(){
        if(this.actual.tipo=="Reservada return"){
            this.emparejar("Reservada return");this.agregarTraduccion("return ");
            //@ts-ignore
            if(this.actual.tipo!="Punto y coma"){
            this.LOGICO();
            }
            this.emparejarClave();
            this.agregarTraduccion("\n");
            this.CONDICIONAL();
        }
    }
    DO(){
        this.emparejar("Reservada do");this.agregarTraduccion("while ");
        this.emparejar("Llaves abrir");this.agregarTraduccion("True:"); this.espacios++;this.agregarTraduccion("\n");
        this.BUCLE();
        this.emparejar("Llaves cerrar");
        this.emparejar("Reservada while");
        this.emparejar("Parentesis abrir");
        this.agregarTraduccion("if (")
        this.LOGICO();
        this.emparejar("Parentesis cerrar"); this.agregarTraduccion("):");this.espacios++;this.agregarTraduccion("\n");
        this.emparejarClave();this.agregarTraduccion("break");
        this.espacios--;
        this.espacios--;
        this.agregarTraduccion("\n");
    }


//------------------------------------------------------------------------------------//
//--------------------------VALIDACIONES Y RECUPERACIONES-----------------------------//
//------------------------------------------------------------------------------------//

//--------------AL ENCONTRAR ERROR, SALTAR A PUNTO Y COMA, SINO SE ENCICLA ESA ONDA
    emparejar(esperado: string) {
        this.controlLista += 1;
        this.actual = this.entrada[this.controlLista];
      
    }
    emparejarClave() {
                this.controlLista += 1;
                this.actual = this.entrada[this.controlLista];
    }
    emparejarSolo(esperado:string){
                this.controlLista += 1;
                this.actual = this.entrada[this.controlLista];
    }
    emparejarVarios() {
                this.controlLista += 1;
                this.actual = this.entrada[this.controlLista];
    }

//------------------------------------------------------------------------------------//
//---------------------------------------TRADUCCION-----------------------------------//
//------------------------------------------------------------------------------------//

    agregarTraduccion(txt:string){
        var tab = "";
        var entrada = "";
        if(!this.banderaFor){

        
            if (txt==("true"))
            {
                txt = "True";
            }
            else if (txt==("false"))
            {
                txt = "False";
            }
            entrada = txt;
            for (let i = 0; i < this.espacios; i++)
            {
                tab += "\t";
            }

            if (entrada==("\n")&&this.contSwitch==0)
            {
                this.linea = 1;
                this.traduccion += "\r";
                this.traduccion += entrada;
            }
            else
            {
                if (this.linea == 1)
                {
                    this.traduccion += tab + "" + entrada;
                    this.linea = 0;
                }
                else
                {
                    if(this.contSwitch!=0){
                        if(entrada=="\n"){
                        entrada=", ";
                        }
                    }
                    this.traduccion += entrada;
                }
            }
        }
    }

  
    agregarHTML(cadena:string){
        var espacios = [' ', '\r', '\t', '\n', '\b', '\f'];
        var inicioEstado = 0;
        var estadoPrincipal = 0;
        var cadenaConcatenar;

        var token = "";
        var atributo="";
        var nombre="";
        var actual=0;
        for (inicioEstado = 0; inicioEstado < cadena.length; inicioEstado++) {
            cadenaConcatenar = cadena[inicioEstado]
            switch (estadoPrincipal) {
                case 0:

                    switch (cadenaConcatenar) {
                        case ' ':
                        case '\r':
                        case '\b':
                        case '\f':
                        case '\t':
                        case '\n':
                            estadoPrincipal = 0;
                            break;
                        default:
                            token="";
                            atributo="";
                            nombre="";
                            actual=0;
                            if (cadenaConcatenar=='<') {
                                    token += cadenaConcatenar;
                                    estadoPrincipal = 1;    
                            }       
                            else{
                                token += cadenaConcatenar;
                                estadoPrincipal = 2;
                            }
                        break;                     
                    }
                break;

                case 1:
                    switch(actual){
                        case 0:
                            if(cadenaConcatenar=='/'){
                                token+=cadenaConcatenar;
                                actual=4;
                            }
                            else{
                                inicioEstado--;
                                actual=1;
                            }
                            break;
                        case 1:
                            if(espacios.includes(cadenaConcatenar)){
                                token+=nombre+" ";
                                actual=2;
                            }
                            else if(cadenaConcatenar=='>'){
                                token+=nombre;
                                token+=cadenaConcatenar;
                                var instancia:Etiqueta=new Etiqueta("Etiqueta abrir",token,nombre,atributo);
                                if(nombre=="br"||nombre=="input"){
                                    instancia.cerrar=false;
                                }
                                this.html.push(instancia);
                                estadoPrincipal=0;
                            }
                            else{
                                nombre+=cadenaConcatenar;
                            }
                            break;
                        case 2:
                            if(cadenaConcatenar=='>'){
                                token+=atributo;
                                token+=cadenaConcatenar;
                                var instancia:Etiqueta=new Etiqueta("Etiqueta abrir",token,nombre,atributo);
                                if(nombre=="br"||nombre=="input"){
                                    instancia.cerrar=false;
                                }
                                this.html.push(instancia);
                                estadoPrincipal=0;
                            }
                            else if(cadenaConcatenar=='"'){
                                actual=3;
                                token+=cadenaConcatenar;
                            }    
                            else{
                                token+=cadenaConcatenar;
                            }  
                            break;
                        case 3:
                            if(cadenaConcatenar=='"'){
                                actual=2;
                            } 
                            else{
                                atributo+=cadenaConcatenar;
                            }
                            break;
                        case 4:
                             if(espacios.includes(cadenaConcatenar)){
                                actual=5;
                             }
                             else if(cadenaConcatenar=='>'){
                                token+=cadenaConcatenar;
                                var instancia:Etiqueta=new Etiqueta("Etiqueta Cerrar",token,nombre,atributo);
                                this.html.push(instancia);  
                                estadoPrincipal=0;     
                            }
                             else{
                                 token+=cadenaConcatenar;
                             }
                            break;
                        case 5:
                            if(cadenaConcatenar=='>'){
                                token+=cadenaConcatenar;
                                var instancia:Etiqueta=new Etiqueta("Etiqueta Cerrar",token,nombre,atributo);
                                this.html.push(instancia);   
                                estadoPrincipal=0;    
                            }
                            break;   
                    }
                 
                    break;
                case 2:
                    if(cadenaConcatenar=='<'){
                        inicioEstado--;
                        var instancia:Etiqueta=new Etiqueta("Contenido",token,"","");
                        this.html.push(instancia);
                        estadoPrincipal=0;
                        
                    }
                    else{
                        token+=cadenaConcatenar;
                    }
                    break; 
                }
                

        }
    }
   
    returnHTML(){
        return this.html;
    }

    caracteresIguales(s:String)
    {
        var n = s.length;
        for (let i = 1; i < n; i++) {
            if(s[i]!=" "){
                return false;
            }
        }
        return true;
    }
}