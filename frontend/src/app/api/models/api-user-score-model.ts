/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

export interface apiUserScoreModel {
  affiliate_id: number;
  affiliate_rank: number;
  affiliate_scaled: 'RX' | 'Scaled';
  age_category: 'Open' | 'Masters' | 'Masters 55+';
  appreciation_score: number;
  attendance_score: number;
  crossfit_id: number;
  gender: 'M' | 'F';
  judge_score: number;
  name: string;
  ordinal: number;
  participation_score: number;
  score_display: string;
  team_name: string;
  tiebreak_ms?: (string | null);
  top3_score: number;
  total_individual_score: number;
  year: number;
}
