import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

/**
 * Angular App Configuration
 * Sets up:
 * - Global error listeners (catches uncaught errors)
 * - Router (URL routing + navigation)
 * - HttpClient (makes requests to API)
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(), // Catch JS errors
    provideRouter(routes), // Enable routing
    provideHttpClient() // Enable HTTP requests (for api.ts service)
  ]
};
