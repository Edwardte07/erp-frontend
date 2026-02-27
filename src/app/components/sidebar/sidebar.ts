import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { PanelMenuModule } from 'primeng/panelmenu';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, PanelMenuModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  items: MenuItem[] = [
    {
      label: 'Inicio',
      icon: 'pi pi-home',
      routerLink: ['/home'],
    },

    {
      label: 'Catálogos',
      icon: 'pi pi-database',
      items: [
      ],
    },

    {
      label: 'Pages',
      icon: 'pi pi-th-large',
      items: [
        {
          label: 'Group',
          icon: 'pi pi-users',
          routerLink: ['/group'],
        },
        {
          label: 'User',
          icon: 'pi pi-user',
          routerLink: ['/user'],
        }
      ],
    },

    {
      label: 'Configuración',
      icon: 'pi pi-cog',
      items: [
        { label: 'Perfil (demo)', icon: 'pi pi-user', routerLink: ['/home'] },
      ],
    },
  ];
}