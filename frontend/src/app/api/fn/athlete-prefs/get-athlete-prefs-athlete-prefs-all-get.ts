/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { apiAthletePrefsOutputModel } from '../../models/api-athlete-prefs-output-model';

export interface GetAthletePrefsAthletePrefsAllGet$Params {
  affiliate_id: number;
  year: number;
}

export function getAthletePrefsAthletePrefsAllGet(http: HttpClient, rootUrl: string, params: GetAthletePrefsAthletePrefsAllGet$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<apiAthletePrefsOutputModel>>> {
  const rb = new RequestBuilder(rootUrl, getAthletePrefsAthletePrefsAllGet.PATH, 'get');
  if (params) {
    rb.query('affiliate_id', params.affiliate_id, {});
    rb.query('year', params.year, {});
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<Array<apiAthletePrefsOutputModel>>;
    })
  );
}

getAthletePrefsAthletePrefsAllGet.PATH = '/athlete-prefs/all';
