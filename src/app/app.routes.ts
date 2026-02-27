import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { Login } from './pages/auth/login/login';
import { Register } from './pages/auth/register/register';
import { authGuard } from './components/guards/auth.guard';

import { Mainlayout } from './layout/mainlayout/mainlayout';
import { Home } from './pages/home/home';
<<<<<<< HEAD

=======
import { Group } from './pages/group/group';
import { User } from './pages/user/user';
>>>>>>> 23ce237 (Practica 5)
export const routes: Routes = [

  // Página pública inicial
  { path: '', component: Landing },

  // Auth (público)
  {
    path: 'auth',
    children: [
      { path: 'login', component: Login },
      { path: 'register', component: Register }
    ]
  },

  // Zona privada con layout + guard
  {
    path: '',
    component: Mainlayout,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: Home },
<<<<<<< HEAD
      // aquí se puede agregar más:
      // { path: 'divisiones', component: Divisiones }
=======
      { path: 'group', component: Group },
      { path: 'user', component: User }
>>>>>>> 23ce237 (Practica 5)
    ]
  },

  { path: '**', redirectTo: '' }
];