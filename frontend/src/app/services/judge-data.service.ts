import { inject, Injectable, signal, computed } from '@angular/core';
import {
  apiJudgeAvailabilityService,
  apiJudgesService,
} from 'src/app/api/services';
import { apiJudgeAvailabilityModel, apiJudgesModel } from 'src/app/api/models';
import { AppConfigService } from './app-config.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class JudgeDataService {
  private apiJudges = inject(apiJudgesService);
  private apiJudgeAvailability = inject(apiJudgeAvailabilityService);
  private config = inject(AppConfigService);
  private toastService = inject(ToastService);

  // Signals for state management
  readonly judges = signal<apiJudgesModel[]>([]);
  readonly judgeAvailabilities = signal<apiJudgeAvailabilityModel[]>([]);
  readonly myJudgeAvailability = signal<apiJudgeAvailabilityModel[]>([]);
  readonly judgesLoading = signal<boolean>(false);
  readonly availabilitiesLoading = signal<boolean>(false);
  readonly myAvailabilityLoading = signal<boolean>(false);

  // Computed signals
  readonly judgeNames = computed(() =>
    this.judges()
      .map((j) => j.name)
      .sort((a, b) => a.localeCompare(b)),
  );

  /**
   * Load all judges for the current affiliate
   */
  loadJudges(): Promise<void> {
    this.judgesLoading.set(true);
    return new Promise((resolve) => {
      this.apiJudges
        .getJudgesListJudgesAllGet({
          affiliate_id: this.config.affiliateId,
        })
        .subscribe({
          next: (data) => {
            this.judges.set(data.sort((a, b) => a.name.localeCompare(b.name)));
            this.judgesLoading.set(false);
            resolve();
          },
          error: (error) => {
            this.toastService.showToast(
              'Error loading judges: ' +
                (error?.error?.detail ? error.error.detail : 'Unknown error'),
              'danger',
              null,
              3000,
            );
            this.judgesLoading.set(false);
            resolve();
          },
        });
    });
  }

  /**
   * Load all judge availabilities (admin)
   */
  loadAllJudgeAvailabilities(): Promise<void> {
    this.availabilitiesLoading.set(true);
    return new Promise((resolve) => {
      this.apiJudgeAvailability
        .getJudgeAvailabilitiesListJudgeAvailabilityGet()
        .subscribe({
          next: (data) => {
            this.judgeAvailabilities.set(data);
            this.availabilitiesLoading.set(false);
            resolve();
          },
          error: (error) => {
            this.toastService.showToast(
              'Error loading judge availabilities: ' +
                (error?.error?.detail ? error.error.detail : 'Unknown error'),
              'danger',
              null,
              3000,
            );
            this.availabilitiesLoading.set(false);
            resolve();
          },
        });
    });
  }

  /**
   * Load the current user's judge availability
   */
  loadMyJudgeAvailability(): Promise<void> {
    this.myAvailabilityLoading.set(true);
    return new Promise((resolve) => {
      this.apiJudgeAvailability
        .getMyJudgeAvailabilityJudgeAvailabilityMeGet()
        .subscribe({
          next: (data) => {
            this.myJudgeAvailability.set(data);
            this.myAvailabilityLoading.set(false);
            resolve();
          },
          error: (error) => {
            this.toastService.showToast(
              'Error loading availabilities: ' +
                (error?.error?.detail ? error.error.detail : 'Unknown error'),
              'danger',
              null,
              3000,
            );
            this.myAvailabilityLoading.set(false);
            resolve();
          },
        });
    });
  }

  /**
   * Load both judges and all availabilities (for modals/admin views)
   */
  loadJudgesAndAvailabilities(): void {
    this.loadJudges();
    this.loadAllJudgeAvailabilities();
  }

  /**
   * Update a judge availability record (admin)
   */
  updateJudgeAvailability(availabilityId: string, available: boolean): void {
    this.apiJudgeAvailability
      .updateExistingJudgeAvailabilityJudgeAvailabilityAvailabilityIdPatch({
        availability_id: availabilityId,
        body: {
          available: available,
        },
      })
      .subscribe({
        next: (updated) => {
          this.judgeAvailabilities.update((avails) =>
            avails.map((a) => (a.id === updated.id ? updated : a)),
          );
          this.toastService.showToast(
            'Availability updated',
            'success',
            null,
            2000,
          );
        },
        error: (error) => {
          this.toastService.showToast(
            'Error updating availability: ' +
              (error?.error?.detail ? error.error.detail : 'Unknown error'),
            'danger',
            null,
            3000,
          );
          // Reload on error to revert any optimistic updates
          this.loadAllJudgeAvailabilities();
        },
      });
  }

  /**
   * Update the current user's judge availability
   */
  updateMyJudgeAvailability(availabilityId: string, available: boolean): void {
    this.apiJudgeAvailability
      .updateMyJudgeAvailabilityJudgeAvailabilityMeAvailabilityIdPatch({
        availability_id: availabilityId,
        body: {
          available: available,
        },
      })
      .subscribe({
        next: (updated) => {
          this.myJudgeAvailability.update((avails) =>
            avails.map((a) => (a.id === updated.id ? updated : a)),
          );
          this.toastService.showToast(
            'Availability updated',
            'success',
            null,
            2000,
          );
        },
        error: (error) => {
          this.toastService.showToast(
            'Error updating availability: ' +
              (error?.error?.detail ? error.error.detail : 'Unknown error'),
            'danger',
            null,
            3000,
          );
          // Reload on error to revert any optimistic updates
          this.loadMyJudgeAvailability();
        },
      });
  }

  /**
   * Get availabilities for a specific judge (filtered from all availabilities)
   */
  getAvailabilitiesForJudge(judgeId: string): apiJudgeAvailabilityModel[] {
    return this.judgeAvailabilities().filter(
      (avail) => avail.judge_id === judgeId,
    );
  }
}
