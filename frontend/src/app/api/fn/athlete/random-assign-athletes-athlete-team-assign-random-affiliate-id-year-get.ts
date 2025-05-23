/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface RandomAssignAthletesAthleteTeamAssignRandomAffiliateIdYearGet$Params {
  affiliate_id: number;
  year: number;
}

export function randomAssignAthletesAthleteTeamAssignRandomAffiliateIdYearGet(http: HttpClient, rootUrl: string, params: RandomAssignAthletesAthleteTeamAssignRandomAffiliateIdYearGet$Params, context?: HttpContext): Observable<StrictHttpResponse<any>> {
  const rb = new RequestBuilder(rootUrl, randomAssignAthletesAthleteTeamAssignRandomAffiliateIdYearGet.PATH, 'get');
  if (params) {
    rb.path('affiliate_id', params.affiliate_id, {});
    rb.path('year', params.year, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<any>;
    })
  );
}

randomAssignAthletesAthleteTeamAssignRandomAffiliateIdYearGet.PATH = '/athlete/team/assign/random/{affiliate_id}/{year}';
