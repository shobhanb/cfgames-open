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
    year: 2025,
  },
  itcf: {
    affiliateId: 22847,
    affiliateName: 'I Think Crossfit',
    apiBaseUrl: 'https://itcf.cfgames.site/api',
    year: 2025,
  },
  enduro: {
    affiliateId: 2539,
    affiliateName: 'Crossfit Enduro',
    apiBaseUrl: 'https://enduro.cfgames.site/api',
    year: 2025,
  },
};

export const defaultConfig = 'itcf';
