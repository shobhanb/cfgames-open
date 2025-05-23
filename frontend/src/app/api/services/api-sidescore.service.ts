/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { BaseService } from '../base-service';
import { ApiConfiguration } from '../api-configuration';
import { StrictHttpResponse } from '../strict-http-response';

import { applySidescoresSidescoreApplyAffiliateIdYearPost } from '../fn/sidescore/apply-sidescores-sidescore-apply-affiliate-id-year-post';
import { ApplySidescoresSidescoreApplyAffiliateIdYearPost$Params } from '../fn/sidescore/apply-sidescores-sidescore-apply-affiliate-id-year-post';
import { getSidescoresSidescoreAffiliateIdYearGet } from '../fn/sidescore/get-sidescores-sidescore-affiliate-id-year-get';
import { GetSidescoresSidescoreAffiliateIdYearGet$Params } from '../fn/sidescore/get-sidescores-sidescore-affiliate-id-year-get';
import { apiSideScoreModel } from '../models/api-side-score-model';
import { updateSidescoresSidescoreAffiliateIdYearPost } from '../fn/sidescore/update-sidescores-sidescore-affiliate-id-year-post';
import { UpdateSidescoresSidescoreAffiliateIdYearPost$Params } from '../fn/sidescore/update-sidescores-sidescore-affiliate-id-year-post';

@Injectable({ providedIn: 'root' })
export class apiSidescoreService extends BaseService {
  constructor(config: ApiConfiguration, http: HttpClient) {
    super(config, http);
  }

  /** Path part for operation `getSidescoresSidescoreAffiliateIdYearGet()` */
  static readonly GetSidescoresSidescoreAffiliateIdYearGetPath = '/sidescore/{affiliate_id}/{year}/';

  /**
   * Get Sidescores.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `getSidescoresSidescoreAffiliateIdYearGet()` instead.
   *
   * This method doesn't expect any request body.
   */
  getSidescoresSidescoreAffiliateIdYearGet$Response(params: GetSidescoresSidescoreAffiliateIdYearGet$Params, context?: HttpContext): Observable<StrictHttpResponse<Array<apiSideScoreModel>>> {
    return getSidescoresSidescoreAffiliateIdYearGet(this.http, this.rootUrl, params, context);
  }

  /**
   * Get Sidescores.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `getSidescoresSidescoreAffiliateIdYearGet$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  getSidescoresSidescoreAffiliateIdYearGet(params: GetSidescoresSidescoreAffiliateIdYearGet$Params, context?: HttpContext): Observable<Array<apiSideScoreModel>> {
    return this.getSidescoresSidescoreAffiliateIdYearGet$Response(params, context).pipe(
      map((r: StrictHttpResponse<Array<apiSideScoreModel>>): Array<apiSideScoreModel> => r.body)
    );
  }

  /** Path part for operation `updateSidescoresSidescoreAffiliateIdYearPost()` */
  static readonly UpdateSidescoresSidescoreAffiliateIdYearPostPath = '/sidescore/{affiliate_id}/{year}/';

  /**
   * Update Sidescores.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `updateSidescoresSidescoreAffiliateIdYearPost()` instead.
   *
   * This method doesn't expect any request body.
   */
  updateSidescoresSidescoreAffiliateIdYearPost$Response(params: UpdateSidescoresSidescoreAffiliateIdYearPost$Params, context?: HttpContext): Observable<StrictHttpResponse<apiSideScoreModel>> {
    return updateSidescoresSidescoreAffiliateIdYearPost(this.http, this.rootUrl, params, context);
  }

  /**
   * Update Sidescores.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `updateSidescoresSidescoreAffiliateIdYearPost$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  updateSidescoresSidescoreAffiliateIdYearPost(params: UpdateSidescoresSidescoreAffiliateIdYearPost$Params, context?: HttpContext): Observable<apiSideScoreModel> {
    return this.updateSidescoresSidescoreAffiliateIdYearPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<apiSideScoreModel>): apiSideScoreModel => r.body)
    );
  }

  /** Path part for operation `applySidescoresSidescoreApplyAffiliateIdYearPost()` */
  static readonly ApplySidescoresSidescoreApplyAffiliateIdYearPostPath = '/sidescore/apply/{affiliate_id}/{year}';

  /**
   * Apply Sidescores.
   *
   *
   *
   * This method provides access to the full `HttpResponse`, allowing access to response headers.
   * To access only the response body, use `applySidescoresSidescoreApplyAffiliateIdYearPost()` instead.
   *
   * This method doesn't expect any request body.
   */
  applySidescoresSidescoreApplyAffiliateIdYearPost$Response(params: ApplySidescoresSidescoreApplyAffiliateIdYearPost$Params, context?: HttpContext): Observable<StrictHttpResponse<any>> {
    return applySidescoresSidescoreApplyAffiliateIdYearPost(this.http, this.rootUrl, params, context);
  }

  /**
   * Apply Sidescores.
   *
   *
   *
   * This method provides access only to the response body.
   * To access the full response (for headers, for example), `applySidescoresSidescoreApplyAffiliateIdYearPost$Response()` instead.
   *
   * This method doesn't expect any request body.
   */
  applySidescoresSidescoreApplyAffiliateIdYearPost(params: ApplySidescoresSidescoreApplyAffiliateIdYearPost$Params, context?: HttpContext): Observable<any> {
    return this.applySidescoresSidescoreApplyAffiliateIdYearPost$Response(params, context).pipe(
      map((r: StrictHttpResponse<any>): any => r.body)
    );
  }

}
