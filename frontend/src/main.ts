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
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApiModule } from './app/api/api.module';
import { AppConfigService } from './app/services/app-config.service';
import { isDevMode } from '@angular/core';
import { provideServiceWorker } from '@angular/service-worker';
import { authInterceptor } from './app/providers/auth.interceptor';
import { errorInterceptor } from './app/providers/error.interceptor';

// Create config service instance to get dynamic configuration
const configService = new AppConfigService();

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ mode: 'ios' }),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
      withComponentInputBinding()
    ),
    // Use dynamic API base URL
    ...(ApiModule.forRoot({ rootUrl: configService.apiBaseUrl }).providers ??
      []),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
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
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:3000',
    }),
  ],
});
