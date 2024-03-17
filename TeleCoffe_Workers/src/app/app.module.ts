import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, provideFirebaseApp(() => initializeApp({"projectId":"lpro-workers","appId":"1:945879346205:web:8eb0b852d9cd8be7c0aaf4","storageBucket":"lpro-workers.appspot.com","apiKey":"AIzaSyDm-vKdUAryQ07QaCkCc_xU-j5UJPrnQRg","authDomain":"lpro-workers.firebaseapp.com","messagingSenderId":"945879346205","measurementId":"G-DDS83BHVR9"})), provideAuth(() => getAuth())],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
