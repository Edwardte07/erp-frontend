import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { Auth } from '../../services/auth';
import { GroupService } from '../../services/group.service';
import { Group, User, SessionUser } from '../../../models/app.models';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-groups',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    CardModule, ButtonModule, DialogModule,
    InputTextModule, MultiSelectModule, TableModule, ToastModule
  ],
  templateUrl: './groups.html',
  styleUrls: ['./groups.css']
})
export class Groups implements OnInit {
  private auth         = inject(Auth);
  private groupService = inject(GroupService);
  private http         = inject(HttpClient);
  private router       = inject(Router);
  private msg          = inject(MessageService);

  currentUser: SessionUser | null = null;
  groups: Group[] = [];
  users:  User[]  = [];
  loading    = false;
  showDialog = false;
  editMode   = false;
  selectedGroupId: string | null = null;

  form = { name: '', description: '', userIds: [] as string[] };

  // ── Permisos por grupo ───────────────────────────────────────────
  showPermisosDialog    = false;
  permisosGrupoId:      string | null = null;
  permisosGrupoNombre   = '';
  permisosUsuarioId:    string | null = null;
  permisosUsuarioNombre = '';
  permisosAsignados:    string[] = [];
  loadingPermisos       = false;

  allPermissions = [
    'ticket:view','ticket:add','ticket:edit','ticket:delete',
    'ticket:edit:comment','ticket:edit:state','ticket:manage',
    'group:view','group:edit','group:manage',
    'group:members:add','group:members:remove'
  ];

  async ngOnInit(): Promise<void> {
    this.currentUser = this.auth.getUser();
    if (!this.currentUser) { this.router.navigate(['/auth/login']); return; }

    const canManage = this.currentUser.role === 'superadmin' ||
      this.currentUser.permissions.some(p =>
        ['group:add','group:edit','group:delete','group:view','group:manage'].includes(p)
      );

    if (!canManage) { this.router.navigate(['/home']); return; }

    await this.loadData();
  }

  async loadData(): Promise<void> {
    this.loading = true;
    try {
      const [groups, users] = await Promise.all([
        this.groupService.getAllGroups(),
        this.groupService.getAllUsers()
      ]);
      this.groups = groups;
      this.users  = users;
    } catch {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la información' });
    } finally {
      this.loading = false;
    }
  }

  openCreate(): void {
    this.editMode = false;
    this.selectedGroupId = null;
    this.form = { name: '', description: '', userIds: [] };
    this.showDialog = true;
  }

  openEdit(group: Group): void {
    this.editMode = true;
    this.selectedGroupId = group.id;
    this.form = { name: group.name, description: group.description, userIds: [...group.userIds] };
    this.showDialog = true;
  }

  async save(): Promise<void> {
    if (!this.form.name.trim()) return;
    this.loading = true;
    try {
      if (this.editMode && this.selectedGroupId) {
        await this.groupService.updateGroup({
          id: this.selectedGroupId,
          name: this.form.name,
          description: this.form.description,
          userIds: this.form.userIds
        });
        await this.groupService.assignUsersToGroup(this.selectedGroupId, this.form.userIds);
        this.msg.add({ severity: 'success', summary: 'OK', detail: 'Grupo actualizado' });
      } else {
        const newGroup = await this.groupService.createGroup(this.form.name, this.form.description);
        await this.groupService.assignUsersToGroup(newGroup.id, this.form.userIds);
        this.msg.add({ severity: 'success', summary: 'OK', detail: 'Grupo creado' });
      }
      await this.auth.refreshSession();
      this.showDialog = false;
      await this.loadData();
    } catch {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el grupo' });
    } finally {
      this.loading = false;
    }
  }

  async delete(groupId: string): Promise<void> {
    this.loading = true;
    try {
      await this.groupService.deleteGroup(groupId);
      await this.auth.refreshSession();
      await this.loadData();
      this.msg.add({ severity: 'success', summary: 'OK', detail: 'Grupo eliminado' });
    } catch {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el grupo' });
    } finally {
      this.loading = false;
    }
  }

  // ── Permisos por grupo ───────────────────────────────────────────

  async openPermisos(group: Group, user: User): Promise<void> {
    this.permisosGrupoId       = group.id;
    this.permisosGrupoNombre   = group.name;
    this.permisosUsuarioId     = user.id;
    this.permisosUsuarioNombre = user.name;
    this.permisosAsignados     = [];
    this.loadingPermisos       = true;
    this.showPermisosDialog    = true;

    try {
      const data = await firstValueFrom(
        this.http.get<any[]>(
          `${environment.apiGatewayUrl}/groups/${group.id}/members/${user.id}/permisos`
        )
      );
      this.permisosAsignados = data.map((p: any) => p.nombre || p);
    } catch {
      this.permisosAsignados = [];
    } finally {
      this.loadingPermisos = false;
    }
  }

  getUnassignedGroupPerms(): string[] {
    return this.allPermissions.filter(p => !this.permisosAsignados.includes(p));
  }

  addGroupPerm(perm: string): void {
    if (!this.permisosAsignados.includes(perm)) {
      this.permisosAsignados = [...this.permisosAsignados, perm];
    }
  }

  removeGroupPerm(perm: string): void {
    this.permisosAsignados = this.permisosAsignados.filter(p => p !== perm);
  }

  async savePermisos(): Promise<void> {
    if (!this.permisosGrupoId || !this.permisosUsuarioId) return;
    this.loadingPermisos = true;
    try {
      await this.groupService.setPermisosMiembro(
        this.permisosGrupoId,
        this.permisosUsuarioId,
        this.permisosAsignados
      );
      this.showPermisosDialog = false;
      this.msg.add({ severity: 'success', summary: 'OK', detail: 'Permisos actualizados' });
    } catch {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron guardar los permisos' });
    } finally {
      this.loadingPermisos = false;
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────

  getMembersOfGroup(group: Group): User[] {
    return this.users.filter(u => group.userIds.includes(u.id));
  }

  getUserNames(userIds: string[]): string {
    return this.users.filter(u => userIds.includes(u.id)).map(u => u.name).join(', ');
  }

  canCreateGroups(): boolean {
    return !!this.currentUser && (this.currentUser.role === 'superadmin' || this.currentUser.permissions.includes('group:add'));
  }
  canEditGroups(): boolean {
    return !!this.currentUser && (this.currentUser.role === 'superadmin' || this.currentUser.permissions.includes('group:edit'));
  }
  canDeleteGroups(): boolean {
    return !!this.currentUser && (this.currentUser.role === 'superadmin' || this.currentUser.permissions.includes('group:delete'));
  }
  canManagePermisos(): boolean {
    return !!this.currentUser && (this.currentUser.role === 'superadmin' || this.currentUser.permissions.includes('group:manage'));
  }
}