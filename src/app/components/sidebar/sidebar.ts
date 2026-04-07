import { Component, OnInit, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';

import { Auth } from '../../services/auth';
import { SessionUser } from '../../../models/app.models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, PanelMenuModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit {
  private auth   = inject(Auth);
  private router = inject(Router);

  currentUser: SessionUser | null = null;
  items: MenuItem[] = [];

  constructor() {
    effect(() => {
      this.currentUser = this.auth.currentUser$();
      this.buildMenu();
    });
  }

  ngOnInit(): void {
    this.currentUser = this.auth.getUser();
    this.buildMenu();
  }

  buildMenu(): void {
    this.items = [
      { label: 'Inicio', icon: 'pi pi-home', command: () => this.router.navigate(['/home']) }
    ];

    if (this.canManageUsers()) {
      this.items.push({ label: 'Usuarios', icon: 'pi pi-users', command: () => this.router.navigate(['/users']) });
    }

    if (this.canManageGroups()) {
      this.items.push({ label: 'Grupos', icon: 'pi pi-box', command: () => this.router.navigate(['/groups']) });
    }

    this.items.push({ label: 'Perfil', icon: 'pi pi-user', command: () => this.router.navigate(['/user']) });
  }

  canManageGroups(): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'superadmin') return true;
    return this.currentUser.permissions.some(p =>
      ['group:add','group:edit','group:delete','group:view','group:manage'].includes(p)
    );
  }

  canManageUsers(): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'superadmin') return true;
    return this.currentUser.permissions.some(p =>
      ['user:add','user:edit','user:delete','user:view','user:manage'].includes(p)
    );
  }
}
