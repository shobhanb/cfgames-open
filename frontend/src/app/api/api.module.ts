/* tslint:disable */
/* eslint-disable */
/* Code generated by ng-openapi-gen DO NOT EDIT. */

import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiConfiguration, ApiConfigurationParams } from './api-configuration';

import { apiCfeventsService } from './services/api-cfevents.service';
import { apiFireauthService } from './services/api-fireauth.service';
import { apiAthleteService } from './services/api-athlete.service';
import { apiScoreService } from './services/api-score.service';
import { apiAttendanceService } from './services/api-attendance.service';
import { apiAppreciationScoreService } from './services/api-appreciation-score.service';
import { apiAppreciationService } from './services/api-appreciation.service';
import { apiAppreciationStatusService } from './services/api-appreciation-status.service';
import { apiSidescoreService } from './services/api-sidescore.service';
import { apiTeamsService } from './services/api-teams.service';
import { apiAthletePrefsService } from './services/api-athlete-prefs.service';
import { apiHomeBlogService } from './services/api-home-blog.service';

/**
 * Module that provides all services and configuration.
 */
@NgModule({
  imports: [],
  exports: [],
  declarations: [],
  providers: [
    apiCfeventsService,
    apiFireauthService,
    apiAthleteService,
    apiScoreService,
    apiAttendanceService,
    apiAppreciationScoreService,
    apiAppreciationService,
    apiAppreciationStatusService,
    apiSidescoreService,
    apiTeamsService,
    apiAthletePrefsService,
    apiHomeBlogService,
    ApiConfiguration
  ],
})
export class ApiModule {
  static forRoot(params: ApiConfigurationParams): ModuleWithProviders<ApiModule> {
    return {
      ngModule: ApiModule,
      providers: [
        {
          provide: ApiConfiguration,
          useValue: params
        }
      ]
    }
  }

  constructor( 
    @Optional() @SkipSelf() parentModule: ApiModule,
    @Optional() http: HttpClient
  ) {
    if (parentModule) {
      throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
    }
    if (!http) {
      throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
      'See also https://github.com/angular/angular/issues/20575');
    }
  }
}
