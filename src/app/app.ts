import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { Header } from './components/header/header';
import { Footer } from './components/footer/footer';
import { ToastModule } from 'primeng/toast';
import { PermissionsService } from './services/permissions.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToolbarModule, ToastModule, ButtonModule, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ERP');

  constructor(private permsSvc: PermissionsService) {
    // Simular de permisos que vienen del JWT cuando hacemos login
    const jwtPerms = [
      'groups:invitar',
      'users:view',
      'users:edit',
      'tickets:view'
    ];

    this.permsSvc.setPermissions(jwtPerms);
  }
}