import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { userGuard } from '../guards/user.guard';
import { adminGuard } from '../guards/admin.guard';
import { judgeUserGuard } from '../guards/judge-user.guard';

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
        path: 'team-scores/team-info',
        loadComponent: () =>
          import('./team-scores-tab/my-team/my-team.page').then(
            (c) => c.MyTeamPage
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
        path: 'me/appreciation-text',
        loadComponent: () =>
          import(
            './me-tab/my-appreciation-text/my-appreciation-text.page'
          ).then((c) => c.MyAppreciationTextPage),
        canActivate: [userGuard],
      },
      {
        path: 'me/schedule',
        loadComponent: () =>
          import('./me-tab/schedule/schedule.page').then((c) => c.SchedulePage),
        canActivate: [userGuard],
      },
      {
        path: 'me/my-heats',
        loadComponent: () =>
          import('./me-tab/my-heats/my-heats.page').then((c) => c.MyHeatsPage),
        canActivate: [userGuard],
      },
      {
        path: 'me/all-heats',
        loadComponent: () =>
          import('./me-tab/all-heats/all-heats.page').then(
            (c) => c.AllHeatsPage
          ),
      },
      {
        path: 'me/judge-availability',
        loadComponent: () =>
          import('./me-tab/judge-availability/judge-availability.page').then(
            (c) => c.JudgeAvailabilityPage
          ),
        canActivate: [judgeUserGuard],
      },
      {
        path: 'admin',
        loadComponent: () =>
          import('./admin-tab/admin-tab.page').then((c) => c.AdminTabPage),
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
        path: 'admin/auto-assign-teams',
        loadComponent: () =>
          import('./admin-tab/auto-assign-teams/auto-assign-teams.page').then(
            (c) => c.AutoAssignTeamsPage
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
        path: 'admin/judges',
        loadComponent: () =>
          import('./admin-tab/judges/judges.page').then((c) => c.JudgesPage),
        canActivate: [adminGuard],
      },
      {
        path: 'admin/judge-availability-override',
        loadComponent: () =>
          import(
            './admin-tab/judge-availability-override/judge-availability-override.page'
          ).then((c) => c.JudgeAvailabilityOverridePage),
        canActivate: [adminGuard],
      },
      {
        path: 'admin/heats',
        loadComponent: () =>
          import('./admin-tab/heats/heats.page').then((c) => c.HeatsPage),
        canActivate: [adminGuard],
      },
      {
        path: 'admin/manage-heats',
        loadComponent: () =>
          import('./admin-tab/manage-heats/manage-heats.page').then(
            (c) => c.ManageHeatsPage
          ),
        canActivate: [adminGuard],
      },
      {
        path: 'admin/preferred-athletes',
        loadComponent: () =>
          import('./admin-tab/preferred-athletes/preferred-athletes.page').then(
            (c) => c.PreferredAthletesPage
          ),
        canActivate: [adminGuard],
      },
      {
        path: 'admin/schedule-override',
        loadComponent: () =>
          import('./admin-tab/schedule-pref/schedule-pref.page').then(
            (c) => c.SchedulePrefPage
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
        path: 'admin/individual-side-scores',
        loadComponent: () =>
          import(
            './admin-tab/individual-side-score/individual-side-score.page'
          ).then((c) => c.IndividualSideScorePage),
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
        path: 'admin/cf-events',
        loadComponent: () =>
          import('./admin-tab/cf-events/cf-events.page').then(
            (c) => c.CfEventsPage
          ),
        canActivate: [adminGuard],
      },
      {
        path: 'admin/cfdata-refresh',
        loadComponent: () =>
          import('./admin-tab/cfdata-refresh/cfdata-refresh.page').then(
            (c) => c.CfdataRefreshPage
          ),
        canActivate: [adminGuard],
      },
      {
        path: 'admin/users',
        loadComponent: () =>
          import('./admin-tab/users/users.page').then((c) => c.UsersPage),
        canActivate: [adminGuard],
      },
      {
        path: 'admin/blog',
        loadComponent: () =>
          import('./admin-tab/blog/blog.page').then((c) => c.BlogPage),
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
