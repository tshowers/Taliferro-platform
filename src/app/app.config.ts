import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getStorage, provideStorage } from '@angular/fire/storage';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideClientHydration(),
    importProvidersFrom(provideFirebaseApp(() => initializeApp({
      "projectId": "taliferro-de66f",
      "appId": "1:353334442276:web:1c486b3103e7352a725bb1",
      "databaseURL": "https://taliferro-de66f.firebaseio.com",
      "storageBucket": "taliferro-de66f.appspot.com",
      "apiKey": "AIzaSyBBa2iIUnEFhKhVHT3wcepiVEl4BOfOOYA",
      "authDomain": "taliferro-de66f.firebaseapp.com",
      "messagingSenderId": "353334442276",
      "measurementId": "G-Y5C5H83W2S"
    }))),
    importProvidersFrom(provideAuth(() => getAuth())),
    importProvidersFrom(provideFirestore(() => getFirestore())),
    importProvidersFrom(provideDatabase(() => getDatabase())),
    importProvidersFrom(provideMessaging(() => getMessaging())),
    importProvidersFrom(provideStorage(() => getStorage()))
  ]
};
