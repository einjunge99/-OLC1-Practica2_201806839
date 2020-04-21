import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import {lexico } from './Clases/lexico';
import {sintactico } from './Clases/sintactico';
import {python } from './Clases/python';
import {html } from './Clases/html';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [lexico,html,sintactico,python],
  bootstrap: [AppComponent]
})
export class AppModule { }
