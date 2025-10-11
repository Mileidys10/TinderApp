import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { redirectLoggedInTo, redirectUnauthorizedTo, AuthGuard } from '@angular/fire/auth-guard';

const isLogged = () => redirectLoggedInTo(['/home']);
const isNotLogged = () => redirectUnauthorizedTo(['/login']);

const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: 'welcome',
    loadChildren: () => import('./pages/welcome/welcome.module').then(m => m.WelcomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule),
    canActivate: [AuthGuard],
    data: { authGuardPipe: isLogged }, 
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then(m => m.RegisterPageModule),
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule),
    canActivate: [AuthGuard],
    data: { authGuardPipe: isNotLogged },
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then(m => m.ProfilePageModule),
    canActivate: [AuthGuard],
    data: { authGuardPipe: isNotLogged },
  },
  {
    path: 'matching',
    loadChildren: () => import('./pages/matching/matching.module').then(m => m.MatchingPageModule),
    canActivate: [AuthGuard],
    data: { authGuardPipe: isNotLogged },
  },
  {
    path: 'matches',
    loadChildren: () => import('./pages/matches/matches.module').then(m => m.MatchesPageModule),
    canActivate: [AuthGuard],
    data: { authGuardPipe: isNotLogged },
  },
  /*{
    path: 'chat/:chatId', 
    loadChildren: () => import('./pages/chat/chat.module').then(m => m.ChatPageModule),
    canActivate: [AuthGuard],
    data: { authGuardPipe: isNotLogged },
  },*/
  {
    path: '**',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: 'chat',
    loadChildren: () => import('./pages/chat/chat.module').then( m => m.ChatPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }