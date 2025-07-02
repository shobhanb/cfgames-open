import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { userGuard } from '../guards/user.guard';
import { adminGuard } from '../guards/admin.guard';

export const tabsRoutes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./home-tab/home-tab.page').then((c) => c.HomeTabPage),
      },
      {
        path: 'leaderboard',
        loadComponent: () =>
          import('./leaderboard-tab/leaderboard-tab.page').then(
            (c) => c.LeaderboardTabPage
          ),
      },
      {
        path: 'leaderboard/:year/:ordinal',
        loadComponent: () =>
          import('./leaderboard-tab/leaderboard/leaderboard.page').then(
            (c) => c.LeaderboardPage
          ),
      },
      {
        path: 'team-scores',
        loadComponent: () =>
          import('./team-scores-tab/team-scores-tab.page').then(
            (c) => c.TeamScoresTabPage
          ),
      },
      {
        path: 'team-scores/:year/:ordinal',
        loadComponent: () =>
          import('./team-scores-tab/team-scores/team-scores.page').then(
            (c) => c.TeamScoresPage
          ),
      },
      {
        path: 'individual-scores',
        loadComponent: () =>
          import('./individual-scores-tab/individual-scores-tab.page').then(
            (c) => c.IndividualScoresTabPage
          ),
      },
      {
        path: 'individual-scores/:year/:ordinal',
        loadComponent: () =>
          import(
            './individual-scores-tab/individual-scores/individual-scores.page'
          ).then((c) => c.IndividualScoresPage),
      },
      {
        path: 'me',
        loadComponent: () =>
          import('./me-tab/me-tab.page').then((c) => c.MeTabPage),
        canActivate: [userGuard],
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./admin-tab/admin-tab.page').then((c) => c.AdminTabPage),
        canActivate: [adminGuard],
      },
      {
        path: '',
        redirectTo: '/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
];
