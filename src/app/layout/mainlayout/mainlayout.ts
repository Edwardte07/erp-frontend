import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';

import { Sidebar } from '../../components/sidebar/sidebar';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-mainlayout',
  imports: [CommonModule,
            RouterOutlet,
            ToolbarModule,
            ButtonModule,
            Sidebar],
  templateUrl: './mainlayout.html',
  styleUrl: './mainlayout.css',
})
export class Mainlayout {
    constructor(public auth: Auth) {}

  logout(): void {
    this.auth.logout();
  }

}

