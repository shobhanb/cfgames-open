import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideNgIconsConfig } from '@ng-icons/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApiModule } from './api/api.module';
import { environment } from '../environments/environment';
import { userAuthInterceptor } from './shared/user-auth/user-auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideNgIconsConfig({ size: '1.3em' }),
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
    provideMessaging(() => getMessaging()),
    provideHttpClient(withInterceptors([userAuthInterceptor])),

    ...(ApiModule.forRoot({ rootUrl: environment.apiBaseUrl }).providers ?? []),
  ],
};
