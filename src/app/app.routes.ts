import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { authGuard } from './components/guards/auth.guard';

import { Mainlayout } from './layout/mainlayout/mainlayout';
import { Home } from './pages/home/home';

import { User } from './pages/user/user';
import { Groups } from './pages/group/groups';

import { CreateTicket } from './pages/create-ticket/create-ticket';
import { TicketDetail } from './pages/ticket-detail/ticket-detail';
import { Users } from './pages/users/users';

export const routes: Routes = [

  // Página pública inicial
  { path: '', component: Landing },

  // Auth
  {
    path: 'auth',
    children: [
      { path: 'login', component: Login },
      { path: 'register', component: Register }
    ]
  },

  {
    path: '',
    component: Mainlayout,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: Home },
      {path:  'groups', component: Groups},
      { path: 'users', component: Users },
      { path: 'create-ticket', component: CreateTicket },
      { path: 'ticket-detail/:id', component: TicketDetail },
      { path: 'user', component: User }
    ]
  },

  { path: '**', redirectTo: '' }
];