import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SessionUser, LoginResponse } from '../../models/app.models';
import { PermissionsService } from './permissions.service';
import { environment } from '../../environments/environment';

const GW = environment.apiGatewayUrl;

@Injectable({ providedIn: 'root' })
export class Auth {
  private http        = inject(HttpClient);
  private router      = inject(Router);
  private platformId  = inject(PLATFORM_ID);
  private permisos    = inject(PermissionsService);

  private _user = signal<SessionUser | null>(null);
  readonly currentUser$ = computed(() => this._user());

  constructor() {
    if (isPlatformBrowser(this.platformId) && localStorage.getItem('erp_token')) {
      this.loadSessionFromApi().catch(() => {
        localStorage.removeItem('erp_token');
      });
    }
  }

  private async loadSessionFromApi(): Promise<void> {
    try {
      const session = await firstValueFrom(
        this.http.get<SessionUser>(`${GW}/users/me`)
      );
      this._user.set(session);
      // Cargar permisos efectivos (globales + por grupo)
      await this.permisos.cargar(session);
    } catch {
      this._user.set(null);
      localStorage.removeItem('erp_token');
    }
  }

  async login(userOrEmail: string, password: string): Promise<boolean> {
    try {
      const data = await firstValueFrom(
        this.http.post<LoginResponse>(`${GW}/auth/login`, {
          email: userOrEmail,
          password
        })
      );
      localStorage.setItem('erp_token', data.token);
      this._user.set(data.usuario);
      // Cargar permisos tras login
      await this.permisos.cargar(data.usuario);
      return true;
    } catch {
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${GW}/auth/logout`, {}));
    } catch { /* ignorar */ }
    finally {
      localStorage.removeItem('erp_token');
      this._user.set(null);
      this.permisos.limpiar();
      this.router.navigate(['/auth/login']);
    }
  }

  getUser(): SessionUser | null {
    return this._user();
  }

  isLoggedIn(): boolean {
    return !!this._user() || !!localStorage.getItem('erp_token');
  }

  isSuperAdmin(): boolean {
    return this._user()?.role === 'superadmin';
  }

  async refreshSession(): Promise<void> {
    await this.loadSessionFromApi();
  }
}