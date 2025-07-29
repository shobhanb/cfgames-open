import { Injectable } from '@angular/core';
import { AppConfig, configs } from '../config/app.config';

@Injectable({
  providedIn: 'root',
})
export class AppConfigService {
  private config: AppConfig;

  constructor() {
    const subdomain = window.location.hostname.split('.')[0];
    const isProduction = window.location.hostname !== 'localhost';

    if (isProduction) {
      this.config = configs[subdomain] || configs['cfmf'];
    } else {
      this.config = configs['localhost'];
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
