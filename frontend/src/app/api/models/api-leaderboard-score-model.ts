/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

export interface apiLeaderboardScoreModel {
  affiliate_id: number;
  affiliate_rank: number;
  affiliate_scaled: 'RX' | 'Scaled';
  age_category: 'Open' | 'Masters' | 'Masters 55+';
  crossfit_id: number;
  gender: 'M' | 'F';
  name: string;
  ordinal: number;
  score_display: string;
  team_name: string;
  tiebreak_ms?: (string | null);
  year: number;
}
