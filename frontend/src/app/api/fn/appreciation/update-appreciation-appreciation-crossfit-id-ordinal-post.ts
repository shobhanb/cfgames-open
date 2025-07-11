/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';

import { apiAppreciationModelInput } from '../../models/api-appreciation-model-input';
import { apiAppreciationModelOutput } from '../../models/api-appreciation-model-output';

export interface UpdateAppreciationAppreciationCrossfitIdOrdinalPost$Params {
  crossfit_id: number;
  ordinal: number;
      body: apiAppreciationModelInput
}

export function updateAppreciationAppreciationCrossfitIdOrdinalPost(http: HttpClient, rootUrl: string, params: UpdateAppreciationAppreciationCrossfitIdOrdinalPost$Params, context?: HttpContext): Observable<StrictHttpResponse<apiAppreciationModelOutput>> {
  const rb = new RequestBuilder(rootUrl, updateAppreciationAppreciationCrossfitIdOrdinalPost.PATH, 'post');
  if (params) {
    rb.path('crossfit_id', params.crossfit_id, {});
    rb.path('ordinal', params.ordinal, {});
    rb.body(params.body, 'application/json');
  }

  return http.request(
    rb.build({ responseType: 'json', accept: 'application/json', context })
  ).pipe(
    filter((r: any): r is HttpResponse<any> => r instanceof HttpResponse),
    map((r: HttpResponse<any>) => {
      return r as StrictHttpResponse<apiAppreciationModelOutput>;
    })
  );
}

updateAppreciationAppreciationCrossfitIdOrdinalPost.PATH = '/appreciation/{crossfit_id}/{ordinal}';
