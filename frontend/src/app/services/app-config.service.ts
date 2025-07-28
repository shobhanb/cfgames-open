import { Injectable } from '@angular/core';
import { AppConfig, configs } from '../config/app.config';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private config: AppConfig;

  constructor() {
    const subdomain = window.location.hostname.split('.')[0];
    const isProduction = window.location.hostname !== 'localhost';

    // Fallback to cfmf config if subdomain not found
    const baseConfig = configs[subdomain] || configs['itcf'];

    this.config = {
      ...baseConfig,
    };

    if (!isProduction) {
      this.config.apiBaseUrl = environment.apiBaseUrl;
    }
  }

  get affiliateId(): number {
    return this.config.affiliateId;
  }

  get affiliateName(): string {
    return this.config.affiliateName;
  }

  get apiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  get year(): number {
    return this.config.year;
  }

  getConfig(): AppConfig {
    return { ...this.config };
  }
}
