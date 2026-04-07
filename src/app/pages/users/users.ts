import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { Auth } from '../../services/auth';
import { UserService } from '../../services/user.service';
import { User, SessionUser } from '../../../models/app.models';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    TableModule, CardModule, ButtonModule, DialogModule,
    InputTextModule, DropdownModule, ToastModule
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.css']
})
export class Users implements OnInit {
  private auth        = inject(Auth);
  private userService = inject(UserService);
  private router      = inject(Router);
  private msg         = inject(MessageService);

  currentUser: SessionUser | null = null;
  users: User[] = [];
  showDialog = false;
  editMode   = false;
  loading    = false;
  selectedUserId: string | null = null;

  permissionOptions = [
    'group:add','group:edit','group:delete','group:view','group:manage',
    'group:members:add','group:members:remove',
    'user:add','user:edit','user:delete','user:view','user:manage','user:edit:profile',
    'ticket:add','ticket:edit','ticket:delete','ticket:view','ticket:manage',
    'ticket:edit:comment','ticket:edit:state'
  ];

  roleOptions = [
    { label: 'Usuario', value: 'user' },
    { label: 'Superadmin', value: 'superadmin' }
  ];

  form: Omit<User, 'id'> & { password?: string } = {
    name: '', email: '', role: 'user', permissions: [], groupIds: [], password: ''
  };

  async ngOnInit(): Promise<void> {
    this.currentUser = this.auth.getUser();
    if (!this.currentUser) { this.router.navigate(['/auth/login']); return; }

    const canManage = this.currentUser.role === 'superadmin' ||
      this.currentUser.permissions.some(p =>
        ['user:add','user:edit','user:delete','user:view'].includes(p)
      );

    if (!canManage) { this.router.navigate(['/home']); return; }

    await this.loadUsers();
  }

  async loadUsers(): Promise<void> {
    this.loading = true;
    try {
      this.users = await this.userService.getAllUsers();
    } catch {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los usuarios' });
    } finally {
      this.loading = false;
    }
  }

  openCreate(): void {
    this.editMode = false;
    this.selectedUserId = null;
    this.form = { name: '', email: '', role: 'user', permissions: [], groupIds: [], password: '' };
    this.showDialog = true;
  }

  openEdit(user: User): void {
    this.editMode = true;
    this.selectedUserId = user.id;
    this.form = {
      name:        user.name,
      email:       user.email,
      role:        user.role,
      permissions: [...user.permissions],
      groupIds:    [...user.groupIds],
      password:    ''
    };
    this.showDialog = true;
  }

  async save(): Promise<void> {
    if (!this.form.name.trim() || !this.form.email.trim()) return;

    this.loading = true;
    try {
      if (this.editMode && this.selectedUserId) {
        // Construir body sin password si está vacío
        const updateBody: any = {
          id:          this.selectedUserId,
          name:        this.form.name,
          email:       this.form.email,
          role:        this.form.role,
          permissions: this.form.permissions,
          groupIds:    this.form.groupIds,
        };
        if (this.form.password && this.form.password.trim() !== '') {
          updateBody.password = this.form.password;
        }

        await this.userService.updateUser(updateBody);
        await this.userService.setPermissions(this.selectedUserId, this.form.permissions);
        this.msg.add({ severity: 'success', summary: 'OK', detail: 'Usuario actualizado' });
      } else {
        await this.userService.createUser(this.form);
        this.msg.add({ severity: 'success', summary: 'OK', detail: 'Usuario creado' });
      }
      await this.auth.refreshSession();
      this.showDialog = false;
      await this.loadUsers();
    } catch {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el usuario' });
    } finally {
      this.loading = false;
    }
  }

  async delete(userId: string): Promise<void> {
    this.loading = true;
    try {
      await this.userService.deleteUser(userId);
      await this.auth.refreshSession();
      await this.loadUsers();
      this.msg.add({ severity: 'success', summary: 'OK', detail: 'Usuario eliminado' });
    } catch {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el usuario' });
    } finally {
      this.loading = false;
    }
  }

  // ── Permisos dos columnas ─────────────────────────────────────────────────────

  getUnassignedPermissions(): string[] {
    return this.permissionOptions.filter(p => !this.form.permissions.includes(p));
  }

  addPermission(perm: string): void {
    if (!this.form.permissions.includes(perm)) {
      this.form.permissions = [...this.form.permissions, perm];
    }
  }

  removePermission(perm: string): void {
    this.form.permissions = this.form.permissions.filter(p => p !== perm);
  }

  // ── Helpers UI ────────────────────────────────────────────────────────────────

  canCreateUsers(): boolean {
    return !!this.currentUser && (
      this.currentUser.role === 'superadmin' ||
      this.currentUser.permissions.includes('user:add')
    );
  }

  canEditUsers(): boolean {
    return !!this.currentUser && (
      this.currentUser.role === 'superadmin' ||
      this.currentUser.permissions.includes('user:edit')
    );
  }

  canDeleteUsers(): boolean {
    return !!this.currentUser && (
      this.currentUser.role === 'superadmin' ||
      this.currentUser.permissions.includes('user:delete')
    );
  }
}