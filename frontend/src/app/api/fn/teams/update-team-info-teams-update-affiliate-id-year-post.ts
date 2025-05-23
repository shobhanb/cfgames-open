/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { apiTeamsModel } from '../../models/api-teams-model';

export interface UpdateTeamInfoTeamsUpdateAffiliateIdYearPost$Params {
  affiliate_id: number;
  year: number;
  team_name: string;
  instagram?: (string | null);
  logo_url?: (string | null);
}

export function updateTeamInfoTeamsUpdateAffiliateIdYearPost(http: HttpClient, rootUrl: string, params: UpdateTeamInfoTeamsUpdateAffiliateIdYearPost$Params, context?: HttpContext): Observable<StrictHttpResponse<apiTeamsModel>> {
  const rb = new RequestBuilder(rootUrl, updateTeamInfoTeamsUpdateAffiliateIdYearPost.PATH, 'post');
  if (params) {
    rb.path('affiliate_id', params.affiliate_id, {});
    rb.path('year', params.year, {});
    rb.query('team_name', params.team_name, {});
    rb.query('instagram', params.instagram, {});
    rb.query('logo_url', params.logo_url, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<apiTeamsModel>;
    })
  );
}

updateTeamInfoTeamsUpdateAffiliateIdYearPost.PATH = '/teams/update/{affiliate_id}/{year}/';
