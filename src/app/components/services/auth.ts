import { Injectable } from '@angular/core';

type User = { username: string; email: string; password: string };

@Injectable({ providedIn: 'root' })
export class Auth {
  private users: User[] = [
    { username: 'Edu', email: 'edu@mail.com', password: '1234567E@' }
  ];

  constructor() {
    const saved = localStorage.getItem('users');
    if (saved) this.users = JSON.parse(saved);
  }

  login(userOrEmail: string, password: string): boolean {
    const u = userOrEmail.toLowerCase().trim();
    const ok = this.users.some(x =>
      (x.username.toLowerCase() === u || x.email.toLowerCase() === u) &&
      x.password === password
    );
    if (ok) localStorage.setItem('token', 'ok');
    return ok;
  }

  register(user: User) {
    this.users.push(user);
    localStorage.setItem('users', JSON.stringify(this.users));
  }

  isLogged() {
    return localStorage.getItem('token') === 'ok';
  }

  logout() {
    localStorage.removeItem('token');
  }
}
