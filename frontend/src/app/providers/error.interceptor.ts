import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Parse error.error if it's a JSON string
      if (error instanceof HttpErrorResponse && error.error) {
        // If error.error is a string, try to parse it as JSON
        if (typeof error.error === 'string') {
          try {
            const parsed = JSON.parse(error.error);
            // Replace error.error with the parsed object
            error = new HttpErrorResponse({
              error: parsed,
              headers: error.headers,
              status: error.status,
              statusText: error.statusText,
              url: error.url || undefined,
            });
          } catch (e) {
            // If parsing fails, leave error.error as is
            console.warn('Failed to parse error.error as JSON:', e);
          }
        }
      }
      console.error('Error intercepted:', error);

      return throwError(() => error);
    })
  );
};
