export interface AppConfig {
  affiliateId: number;
  affiliateName: string;
  apiBaseUrl: string;
  year: number;
}

export const configs: { [key: string]: AppConfig } = {
  cfmf: {
    affiliateId: 31316,
    affiliateName: 'Crossfit Monkey Flag',
    apiBaseUrl: 'https://cfmf.cfgames.site/api',
    year: 2026,
  },
  enduro: {
    affiliateId: 2539,
    affiliateName: 'Crossfit Enduro',
    apiBaseUrl: 'https://enduro.cfgames.site/api',
    year: 2026,
  },
};

export const defaultConfig = 'cfmf';
