import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { SessionUser } from '../../models/app.models';
import { environment } from '../../environments/environment';

const GW = environment.apiGatewayUrl;

export interface PermisoEfectivo {
  permiso_id: string;
  nombre: string;
  scope: 'global' | 'group';
  grupo_id: string | null;
}

@Injectable({ providedIn: 'root' })
export class PermissionsService {
  private http = inject(HttpClient);

  private _permisos = signal<PermisoEfectivo[]>([]);
  private _usuario  = signal<SessionUser | null>(null);

  readonly esSuperAdmin = computed(() => this._usuario()?.role === 'superadmin');

  async cargar(usuario: SessionUser): Promise<void> {
    this._usuario.set(usuario);
    try {
      const permisos = await firstValueFrom(
        this.http.get<PermisoEfectivo[]>(`${GW}/users/permissions`)
      );
      this._permisos.set(permisos);
    } catch {
      this._permisos.set(
        usuario.permissions.map(nombre => ({
          permiso_id: nombre,
          nombre,
          scope: 'global' as const,
          grupo_id: null
        }))
      );
    }
  }

  limpiar(): void {
    this._permisos.set([]);
    this._usuario.set(null);
  }

  // Devuelve todos los permisos efectivos
  getPermisos(): PermisoEfectivo[] {
    return this._permisos();
  }

  // Verifica permiso global o de cualquier grupo
  hasPermission(permission: string): boolean {
    if (this.esSuperAdmin()) return true;
    return this._permisos().some(p => p.nombre === permission);
  }

  hasAnyPermission(perms: string[]): boolean {
    return perms.some(p => this.hasPermission(p));
  }

  // Verifica permiso SOLO en un grupo específico (no aplica globales)
  hasPermissionInGroup(permission: string, grupoId: string): boolean {
    if (this.esSuperAdmin()) return true;
    return this._permisos().some(p =>
      p.nombre === permission && p.grupo_id === grupoId
    );
  }

  // Verifica permiso global (grupo_id === null)
  hasGlobalPermission(permission: string): boolean {
    if (this.esSuperAdmin()) return true;
    return this._permisos().some(p =>
      p.nombre === permission && p.grupo_id === null
    );
  }

  setPermissions(perms: string[]): void {
    this._permisos.set(
      perms.map(nombre => ({
        permiso_id: nombre,
        nombre,
        scope: 'global' as const,
        grupo_id: null
      }))
    );
  }
}