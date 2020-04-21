import { Component } from '@angular/core';
import { lexico } from './Clases/lexico';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Lexema } from './Objetos/lexema';
import { sintactico } from './Clases/sintactico';
import { ErrorSintactico } from './Objetos/errorSintactico';
import { python } from './Clases/python';
import { Etiqueta } from './Objetos/etiquetas';
import { html } from './Clases/html';

import Swal from 'sweetalert2';
import swal from 'sweetalert';
import { DomSanitizer } from '@angular/platform-browser';
import { delay } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  tabs:number[]=[];
  constructor(private formBuilder: FormBuilder, private sanitizer: DomSanitizer) { }
  ngOnInit() {
    this.tabs.push(0);
    this.primerForm = this.formBuilder.group({
      entrada: [''],
    });
    this.segundoForm = this.formBuilder.group({
      traduccion: [''],
    });
    this.tercerForm = this.formBuilder.group({
      salida: [''],
    });
  }

  title = 'app';

  reporteLexemas: Lexema[];
  auxiliarLexemas: Lexema[];
  errorLexema: Lexema[];
  errorSintactico: ErrorSintactico[];
  diccionario: Lexema[];


  primerForm: FormGroup;
  segundoForm: FormGroup;
  tercerForm: FormGroup;

  traduccion: string = "";
  entrada: string="";
  python: string;

  json: string;
  html: string;

  bandera: boolean = false;

  archivo: any;
  ruta: any;
  nombre: any;

  actual: boolean = false;
  actualNombre: string = "";
  
  actualIndice:number=0;
  contenido:string[]=[];


  modals:any[];
  alertExito={title:"Enhorabuena!",text:"Entrada analizada con éxito!",icon:"success"}
  alertaLexico={title:"Alerta!",text:"Errores léxicos detectados!",icon:"error"}
  alertaSintactico={title:"Alerta!",text:"Errores sintácticos detectados!",icon:"error"}
  alertaRecuperado={title:"Advertencia!",text:"Modo pánico recuperado!",icon:"warning"}
  alertaNoRecuperado={title:"Alerta!",text:"Modo pánico no recuperado!",icon:"error"}
  

  sanitize(url: string) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  guardar() {

    if (!this.actual) {
      swal("Escribe el nombre de tu archivo:", {
        //@ts-ignore
        content: "input",
      })
        .then((value) => {
          this.actualNombre = value;
          this.actual = true;
          this.crear();
        });

    }
    this.crear();

  }
  guardarComo() {
    swal("Escribe el nombre de tu archivo:", {
      //@ts-ignore
      content: "input",
    })
      .then((value) => {
        this.actualNombre = value;
        this.actual = true;
        this.crear();
      });

  }

  crear() {
    var file = new File([this.traduccion], this.actualNombre, { type: "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.href = window.URL.createObjectURL(file);
    a.download = file.name;
    a.id = "test";
    a.style.display = "none";
    document.getElementById("test").click();
    document.getElementById("test").remove();
  }
  
  indice(i:number){
    this.entrada= this.primerForm.value.entrada;
    if(this.entrada==""){
      this.entrada=" ";
    }

    
    this.contenido[this.actualIndice]=this.entrada;

    if(this.contenido[i]!=undefined){
    this.entrada=this.contenido[i];
    }
    else{
      this.entrada=" ";
    }
    this.actualIndice=i;
  }

  cambio(e) {
    this.archivo = e.target.files[0];

    if (this.archivo != undefined) {
      this.actual = true;
      this.actualNombre = this.archivo.name;
      let lector = new FileReader();
      lector.onload = () => {
        this.entrada = lector.result.toString();
      }
      lector.readAsText(this.archivo);
    }

  }

  setHtml() {
    this.python = this.html;
  }
  setJson() {
    this.python = this.json;
  }
  setAuxiliar() {
    this.reporteLexemas.forEach(element => {
      if (element.tipo != "error") {
        this.auxiliarLexemas.push(element);
      }
    });
  }
  agregarTab(){
    this.tabs.push(0);
  }
  analizar() {

  
   // this.contenido[this.actualIndice]=this.entrada;

    this.reporteLexemas = [];
    this.auxiliarLexemas = [];
    this.errorLexema = [];
    this.errorSintactico = [];

    this.diccionario = [];
    this.modals=[];

    this.traduccion = "";
    this.python = "";

    this.html = "";
    this.json = "";

    this.bandera = false;

    var analizadorLexico: lexico = new lexico();

    var entrada = this.primerForm.value.entrada;
    if (entrada.length == 0) {
      swal("Advertencia", "Cadena vacía!", "warning");
    }
    else {
      this.reporteLexemas = analizadorLexico.analizar(entrada);

      if (analizadorLexico.returnErrores() != 0) {
        this.reporteLexemas.forEach(element => {
          if (element.tipo == "error") {
            this.errorLexema.push(element);
          }
        });
        this.bandera = true;
        this.modals.push(this.alertaLexico);
      }
      this.setAuxiliar();

      var analizadorSintactico: sintactico = new sintactico();

      this.auxiliarLexemas.push(new Lexema("ULTIMO", "---", 0, 0));
      this.errorSintactico = analizadorSintactico.analizar(this.auxiliarLexemas);

      if (this.errorSintactico.length == 0) {

        this.diccionario = analizadorSintactico.listaVariables();

        var analizadorPython: python = new python();
        var analizadorHTML: html = new html();

        this.traduccion = analizadorPython.analizar(this.auxiliarLexemas);

        var htmlText: Etiqueta[] = analizadorPython.returnHTML();


        if (htmlText.length != 0) {
          htmlText.push(new Etiqueta("ULTIMO", "", "", ""))
          analizadorHTML.analizar(htmlText);

          this.json = analizadorHTML.returnJSON();
          this.html = analizadorHTML.returnHTML();

          this.python = this.html;
        }



      }
      else{
        this.bandera=true;
        this.modals.push(this.alertaSintactico);
          if (!analizadorSintactico.recuperado()) {
            this.modals.push(this.alertaRecuperado);
          }
          else {
           this.modals.push(this.alertaNoRecuperado);
        }
      }
      if(this.modals.length==0){
        this.modals.push(this.alertExito);
      }
      //@ts-ignore
      Swal.queue(this.modals);

    }

  }


}


