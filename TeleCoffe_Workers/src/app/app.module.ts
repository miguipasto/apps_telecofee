import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { NgApexchartsModule } from 'ng-apexcharts';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    NgApexchartsModule,
    IonicModule.forRoot(),
    AppRoutingModule, 
    provideFirebaseApp(() => initializeApp({
      "projectId":"lpro-workers",
      "appId":"1:945879346205:web:8eb0b852d9cd8be7c0aaf4",
      "storageBucket":"lpro-workers.appspot.com",
      "apiKey":"AIzaSyDm-vKdUAryQ07QaCkCc_xU-j5UJPrnQRg",
      "authDomain":"lpro-workers.firebaseapp.com",
      "messagingSenderId":"945879346205",
      "measurementId":"G-DDS83BHVR9"
    })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    /*
    provideFirebaseApp(() => initializeApp({
      "projectId":"lpro-e1d36",
      "appId":"1:1016118181849:web:7b803bb96800537354e3c8",
      "storageBucket":"lpro-e1d36.appspot.com",
      "apiKey":"AIzaSyAg1CdQTE4M9pAhqTUpqhFwhymENynkXiw",
      "authDomain":"lpro-e1d36.firebaseapp.com",
      "messagingSenderId":"1016118181849"
    }), 'lpro-e1d36') // Asigna un nombre diferente a la segunda instancia
    */
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
