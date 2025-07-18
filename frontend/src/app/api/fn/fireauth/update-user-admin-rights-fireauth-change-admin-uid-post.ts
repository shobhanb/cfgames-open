/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { StrictHttpResponse } from '../../strict-http-response';
import { RequestBuilder } from '../../request-builder';


export interface UpdateUserAdminRightsFireauthChangeAdminUidPost$Params {
  uid: string;
  admin: boolean;
}

export function updateUserAdminRightsFireauthChangeAdminUidPost(http: HttpClient, rootUrl: string, params: UpdateUserAdminRightsFireauthChangeAdminUidPost$Params, context?: HttpContext): Observable<StrictHttpResponse<any>> {
  const rb = new RequestBuilder(rootUrl, updateUserAdminRightsFireauthChangeAdminUidPost.PATH, 'post');
  if (params) {
    rb.path('uid', params.uid, {});
    rb.query('admin', params.admin, {});
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

updateUserAdminRightsFireauthChangeAdminUidPost.PATH = '/fireauth/change-admin/{uid}';
