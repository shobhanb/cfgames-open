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
        path: 'me/my-scores',
        loadComponent: () =>
          import('./me-tab/my-scores/my-scores.page').then(
            (c) => c.MyScoresPage
          ),
        canActivate: [userGuard],
      },
      {
        path: 'me/my-team',
        loadComponent: () =>
          import('./me-tab/my-team/my-team.page').then((c) => c.MyTeamPage),
        canActivate: [userGuard],
      },
      {
        path: 'me/appreciation',
        loadComponent: () =>
          import('./me-tab/appreciation/appreciation.page').then(
            (c) => c.AppreciationPage
          ),
        canActivate: [userGuard],
      },
      {
        path: 'me/appreciation/:year/:ordinal',
        loadComponent: () =>
          import(
            './me-tab/appreciation/edit-appreciation/edit-appreciation.component'
          ).then((c) => c.EditAppreciationComponent),
        canActivate: [userGuard],
      },
      {
        path: 'me/schedule',
        loadComponent: () =>
          import('./me-tab/schedule/schedule.page').then((c) => c.SchedulePage),
        canActivate: [userGuard],
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./admin-tab/admin-tab.page').then((c) => c.AdminTabPage),
        canActivate: [adminGuard],
      },
      {
        path: 'admin/users',
        loadComponent: () =>
          import('./admin-tab/users/users.page').then((c) => c.UsersPage),
        canActivate: [adminGuard],
      },
      {
        path: 'admin/edit-teams',
        loadComponent: () =>
          import('./admin-tab/edit-teams/edit-teams.page').then(
            (c) => c.EditTeamsPage
          ),
        canActivate: [adminGuard],
      },
      {
        path: 'admin/rename-teams',
        loadComponent: () =>
          import('./admin-tab/rename-teams/rename-teams.page').then(
            (c) => c.RenameTeamsPage
          ),
        canActivate: [adminGuard],
      },
      {
        path: 'admin/scheduling',
        loadComponent: () =>
          import('./admin-tab/scheduling/scheduling.page').then(
            (c) => c.SchedulingPage
          ),
        canActivate: [adminGuard],
      },
      {
        path: 'admin/appreciation-status',
        loadComponent: () =>
          import(
            './admin-tab/appreciation-status/appreciation-status.page'
          ).then((c) => c.AppreciationStatusPage),
        canActivate: [adminGuard],
      },
      {
        path: 'admin/appreciation-results',
        loadComponent: () =>
          import(
            './admin-tab/appreciation-results/appreciation-results.page'
          ).then((c) => c.AppreciationResultsPage),
        canActivate: [adminGuard],
      },
      {
        path: 'admin/appreciation-results/:year/:ordinal',
        loadComponent: () =>
          import(
            './admin-tab/appreciation-results/appreciation-result/appreciation-result.page'
          ).then((c) => c.AppreciationResultPage),
        canActivate: [adminGuard],
      },
      {
        path: 'admin/appreciation-results/:year/:ordinal/:crossfitId',
        loadComponent: () =>
          import(
            './admin-tab/appreciation-results/appreciation-result/appreciation-detail/appreciation-detail.page'
          ).then((c) => c.AppreciationDetailPage),
        canActivate: [adminGuard],
      },
      {
        path: 'admin/attendance',
        loadComponent: () =>
          import('./admin-tab/attendance/attendance.page').then(
            (c) => c.AttendancePage
          ),
        canActivate: [adminGuard],
      },
      {
        path: 'admin/side-scores',
        loadComponent: () =>
          import('./admin-tab/side-scores/side-scores.page').then(
            (c) => c.SideScoresPage
          ),
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
