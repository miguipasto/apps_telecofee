import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { NgModule } from '@angular/core';

@NgModule({
  declarations: [AppComponent],
  imports: [
    // Aquí se importa ReactiveFormsModule
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    provideFirebaseApp(() => initializeApp({
      "projectId": "lpro-e1d36",
      "appId": "1:1016118181849:web:7b803bb96800537354e3c8",
      "storageBucket": "lpro-e1d36.appspot.com",
      "apiKey": "AIzaSyAg1CdQTE4M9pAhqTUpqhFwhymENynkXiw",
      "authDomain": "lpro-e1d36.firebaseapp.com",
      "messagingSenderId": "1016118181849"
    })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
