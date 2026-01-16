import { computed, inject, Injectable, signal } from '@angular/core';
import { apiAffiliateConfigService } from '../api/services';
import { apiAffiliateConfigModel } from '../api/models';
import { AppConfigService } from './app-config.service';

@Injectable({
  providedIn: 'root',
})
export class AffiliateConfigService {
  private apiAffiliateConfig = inject(apiAffiliateConfigService);
  private appConfig = inject(AppConfigService);

  private affiliateConfig = signal<apiAffiliateConfigModel | null>(null);
  loading = signal<boolean>(false);

  // Computed values for easy access
  useAppreciation = computed(
    () => this.affiliateConfig()?.use_appreciation ?? false
  );
  useScheduling = computed(
    () => this.affiliateConfig()?.use_scheduling ?? false
  );
  attendanceScore = computed(
    () => this.affiliateConfig()?.attendance_score ?? 0
  );
  participationScore = computed(
    () => this.affiliateConfig()?.participation_score ?? 0
  );
  judgeScore = computed(() => this.affiliateConfig()?.judge_score ?? 0);
  top3Score = computed(() => this.affiliateConfig()?.top3_score ?? 0);
  appreciationScore = computed(
    () => this.affiliateConfig()?.appreciation_score ?? 0
  );
  rookieScore = computed(() => this.affiliateConfig()?.rookie_score ?? 0);
  sideChallengeScore = computed(
    () => this.affiliateConfig()?.side_challenge_score ?? 0
  );
  spiritScore = computed(() => this.affiliateConfig()?.spirit_score ?? 0);

  constructor() {
    this.loadConfig();
  }

  loadConfig() {
    this.loading.set(true);
    this.apiAffiliateConfig
      .getAffiliateConfigAffiliateConfigAffiliateIdYearGet({
        affiliate_id: this.appConfig.affiliateId,
        year: this.appConfig.year,
      })
      .subscribe({
        next: (data) => {
          this.affiliateConfig.set(data);
          this.loading.set(false);
        },
        error: (error) => {
          this.loading.set(false);
        },
      });
  }

  getConfig(): apiAffiliateConfigModel | null {
    return this.affiliateConfig();
  }
}
