import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Lexema } from '../Objetos/lexema';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Etiqueta } from '../Objetos/etiquetas';


@Injectable()
export class html {
    controlLista: number;
    actual: Etiqueta;
    entrada: Etiqueta[];
    json:string;    
    html:string;

    espacios:number=0;
    primLinea:number=0;
    secLinea:number=0;
    analizar(cadena: Etiqueta[]) {  
        this.json="";
        this.html="";
        this.entrada = cadena;
        this.controlLista = 0;
        this.actual = this.entrada[this.controlLista];
        this.INICIO();

    }
    INICIO(){
        this.INSTRUCCIONES();
    }
    INSTRUCCIONES(){
        if(this.actual.tipo=="Etiqueta abrir"){
            if(this.actual.cerrar){
                var atributo=this.actual.atributo;
                this.agregarHTML(this.actual.info); this.agregarJSON("\""+this.actual.nombre+"\":{");
                this.emparejar(); this.espacios++;this.agregarHTML("\n"); this.agregarJSON("\n");
                if(atributo!=""){
                    this.agregarJSON("\"style\":\""+atributo+"\"");
                    this.agregarJSON("\n");
                }
                this.INSTRUCCIONES();
                this.espacios--; this.agregarHTML(this.actual.info); this.agregarJSON("}")
                this.emparejar(); this.agregarHTML("\n"); this.agregarJSON("\n");
                this.INSTRUCCIONES();
            }
            else{
                this.agregarHTML(this.actual.info);this.agregarJSON("\""+this.actual.nombre+"\"")
                this.emparejar();this.agregarHTML("\n"); this.agregarJSON("\n");
                this.INSTRUCCIONES();
            }
        }
        else if(this.actual.tipo=="Contenido"){
                this.agregarJSON("\"TEXTO\":")
                this.agregarHTML(this.actual.info); this.agregarJSON("\""+this.actual.info+"\"");
                this.emparejar(); this.agregarHTML("\n");this.agregarJSON("\n");
                this.INSTRUCCIONES();
            
        }
    }


    emparejar() {
        this.controlLista += 1;
        this.actual = this.entrada[this.controlLista];
      
    }

    agregarHTML(txt:string){
        var tab = "";
        var entrada = "";

            entrada = txt;
            for (let i = 0; i < this.espacios; i++)
            {
                tab += "\t";
            }

            if (entrada==("\n"))
            {
                this.primLinea = 1;
                this.html += "\r";
                this.html += entrada;
            }
            else
            {
                if (this.primLinea == 1)
                {
                    this.html += tab + "" + entrada;
                    this.primLinea = 0;
                }
                else
                {
                    this.html += entrada;
                }
            }
        
    }
    agregarJSON(txt:string){
        var tab = "";
        var entrada = "";

            entrada = txt;
            for (let i = 0; i < this.espacios; i++)
            {
                tab += "\t";
            }

            if (entrada==("\n"))
            {
                this.secLinea = 1;
                this.json += "\r";
                this.json += entrada;
            }
            else
            {
                if (this.secLinea == 1)
                {
                    this.json += tab + "" + entrada;
                    this.secLinea = 0;
                }
                else
                {
                    this.json += entrada;
                }
            }
    }
    returnHTML(){
        return this.html;
    }
    returnJSON(){
        return this.json;
    }

}