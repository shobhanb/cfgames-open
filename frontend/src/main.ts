import { bootstrapApplication } from '@angular/platform-browser';
import {
  RouteReuseStrategy,
  provideRouter,
  withPreloading,
  PreloadAllModules,
  withComponentInputBinding,
} from '@angular/router';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpInterceptor } from './app/providers/http.interceptor';
import { ApiModule } from './app/api/api.module';
import { environment } from './environments/environment';
import { isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ mode: 'ios', swipeBackEnabled: false }),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withComponentInputBinding()
    ),
    ...(ApiModule.forRoot({ rootUrl: environment.apiBaseUrl }).providers ?? []),
    provideHttpClient(withInterceptors([httpInterceptor])),
    provideFirebaseApp(() =>
      initializeApp({
        projectId: 'cfgames-21159',
        appId: '1:1092072319564:web:ce35e0c777ac7944c662e9',
        storageBucket: 'cfgames-21159.firebasestorage.app',
        apiKey: 'AIzaSyA3VWbAqJ3a-ST09Svnk3g2_Tv0j_CvddQ',
        authDomain: 'cfgames-21159.firebaseapp.com',
        messagingSenderId: '1092072319564',
        measurementId: 'G-QSRXKEWN90',
      })
    ),
    provideAuth(() => getAuth()),
    provideMessaging(() => getMessaging()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
});
