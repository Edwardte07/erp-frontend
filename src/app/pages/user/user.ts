import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { MessageService, ConfirmationService } from 'primeng/api';

import { Auth } from '../../services/auth';
import { TicketService } from '../../services/ticket.service';
import { SessionUser, Ticket } from '../../../models/app.models';
import { environment } from '../../../environments/environment';

interface Profile {
  username:  string;
  email:     string;
  role:      string;
  phone:     string;
  address:   string;
  birthdate: string;
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    CardModule, DividerModule, AvatarModule, ButtonModule,
    DialogModule, InputTextModule, ToastModule, ConfirmDialogModule, TagModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './user.html',
  styleUrls: ['./user.css']
})
export class User implements OnInit {
  private auth                = inject(Auth);
  private ticketService       = inject(TicketService);
  private http                = inject(HttpClient);
  private messageService      = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  editDialog   = false;
  savingProfile = false;
  currentUser: SessionUser | null = null;
  tickets: Ticket[] = [];

  profile: Profile = {
    username: '', email: '', role: '',
    phone: '', address: '', birthdate: ''
  };

  async ngOnInit(): Promise<void> {
    this.currentUser = this.auth.getUser();
    if (!this.currentUser) return;
    await this.cargarPerfil();
  }

  private async cargarPerfil(): Promise<void> {
    try {
      const fullUser = await firstValueFrom(
        this.http.get<any>(`${environment.apiGatewayUrl}/users/me`)
      );

      this.profile = {
        username:  fullUser.name      || this.currentUser!.name,
        email:     fullUser.email     || this.currentUser!.email,
        role:      fullUser.role      || this.currentUser!.role,
        phone:     fullUser.phone     || '',
        address:   fullUser.address   || '',
        birthdate: fullUser.birthdate || '',
      };

      if (this.currentUser!.groupIds?.length) {
        const allTickets = await this.ticketService.getTicketsByGroupIds(this.currentUser!.groupIds);
        this.tickets = allTickets.filter(t => t.assignedToUserId === this.currentUser!.id);
      }
    } catch {
      this.profile = {
        username:  this.currentUser!.name,
        email:     this.currentUser!.email,
        role:      this.currentUser!.role,
        phone: '', address: '', birthdate: '',
      };
    }
  }

  get totalAssigned():   number { return this.tickets.length; }
  get pendingCount():    number { return this.tickets.filter(t => t.status === 'Pendiente').length; }
  get inProgressCount(): number { return this.tickets.filter(t => t.status === 'En progreso').length; }
  get doneCount():       number { return this.tickets.filter(t => t.status === 'Hecho').length; }

  openEdit(): void { this.editDialog = true; }

  async saveProfile(): Promise<void> {
    if (!this.currentUser) return;

    this.savingProfile = true;
    try {
      
      await firstValueFrom(
        this.http.put(`${environment.apiGatewayUrl}/users/${this.currentUser.id}`, {
          name:      this.profile.username,
          email:     this.profile.email,
          role:      this.profile.role,
          phone:     this.profile.phone,
          address:   this.profile.address,
          birthdate: this.profile.birthdate,
          permissions: this.currentUser.permissions,
          groupIds:    this.currentUser.groupIds,
        })
      );

      
      await this.auth.refreshSession();
      this.currentUser = this.auth.getUser();

      this.editDialog = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Actualizado',
        detail: 'Perfil actualizado correctamente'
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo actualizar el perfil'
      });
    } finally {
      this.savingProfile = false;
    }
  }

  confirmDelete(): void {
    this.confirmationService.confirm({
      message: '¿Seguro que deseas eliminar tu cuenta?',
      header: 'Confirmación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Cuenta eliminada',
          detail: 'Tu cuenta fue eliminada correctamente'
        });
      }
    });
  }

  getTagSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case 'Pendiente':   return 'warning';
      case 'En progreso': return 'info';
      case 'Hecho':       return 'success';
      case 'Bloqueado':   return 'danger';
      default:            return 'secondary';
    }
  }
}