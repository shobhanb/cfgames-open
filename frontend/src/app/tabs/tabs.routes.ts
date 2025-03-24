import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadComponent: () => import('./home/home.page').then(m => m.HomePage),
        title: 'Home',
      },
      {
        path: 'leaderboard',
        loadComponent: () => import('./leaderboard/leaderboard.page').then(m => m.LeaderboardPage),
        title: 'Leaderboard',
      },
      {
        path: 'team',
        loadComponent: () => import('./team/team.page').then(m => m.TeamPage),
        title: 'Team',
      },
      {
        path: 'scores',
        loadComponent: () => import('./scores/scores.page').then(m => m.ScoresPage),
        title: 'Scores',
      },
      {
        path: 'scheduling',
        loadComponent: () => import('./scheduling/scheduling.page').then(m => m.SchedulingPage),
        title: 'Scheduling'
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full',
  },
];
