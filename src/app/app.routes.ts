import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { authGuard } from './components/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Landing },

  {
    path: 'auth',
    children: [
      { path: 'login', component: Login },
      { path: 'register', component: Register }
    ]
  },

  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },

  { path: '**', redirectTo: '' }
];
