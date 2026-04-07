import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { GroupService } from '../../services/group.service';
import { TicketService } from '../../services/ticket.service';
import { Auth } from '../../services/auth';
import { Ticket, User } from '../../../models/app.models';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    CardModule, ButtonModule, DropdownModule,
    InputTextModule, InputTextareaModule, ToastModule
  ],
  templateUrl: './ticket-detail.html',
  styleUrls: ['./ticket-detail.css']
})
export class TicketDetail implements OnInit {
  private route         = inject(ActivatedRoute);
  private router        = inject(Router);
  private ticketService = inject(TicketService);
  private groupService  = inject(GroupService);
  private auth          = inject(Auth);
  private msg           = inject(MessageService);

  ticket:     Ticket | null = null;
  users:      User[]        = [];
  newComment  = '';
  loading     = false;

  statusOptions   = ['Pendiente', 'En progreso', 'Hecho', 'Bloqueado'];
  priorityOptions = ['Alta', 'Media', 'Baja'];

  async ngOnInit(): Promise<void> {
    const ticketId = this.route.snapshot.paramMap.get('id');
    if (!ticketId) { this.router.navigate(['/home']); return; }

    this.loading = true;
    try {
      const [ticket, users] = await Promise.all([
        this.ticketService.getTicketById(ticketId),
        this.groupService.getAllUsers()
      ]);
      this.ticket = { ...ticket };
      this.users  = users;
    } catch {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el ticket' });
      this.router.navigate(['/home']);
    } finally {
      this.loading = false;
    }
  }

  async saveChanges(): Promise<void> {
    if (!this.ticket) return;
    this.loading = true;
    try {
      await this.ticketService.updateTicket(this.ticket);
      this.msg.add({ severity: 'success', summary: 'OK', detail: 'Ticket guardado' });
      this.router.navigate(['/home']);
    } catch {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo guardar el ticket' });
    } finally {
      this.loading = false;
    }
  }

  async addComment(): Promise<void> {
    if (!this.ticket || !this.newComment.trim()) return;

    const currentUser = this.auth.getUser();
    if (!currentUser) return;

    this.loading = true;
    try {
      const updated = await this.ticketService.addComment(
        this.ticket.id,
        this.ticket.groupId,
        {
          userId:    currentUser.id,
          userName:  currentUser.name,
          message:   this.newComment,
          createdAt: new Date().toISOString()
        }
      );
      this.ticket     = { ...updated };
      this.newComment = '';
      this.msg.add({ severity: 'success', summary: 'OK', detail: 'Comentario agregado' });
    } catch {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo agregar el comentario' });
    } finally {
      this.loading = false;
    }
  }

  getAssignedUserName(userId: string | null): string {
    if (!userId) return 'Sin asignar';
    return this.users.find(u => u.id === userId)?.name || 'Sin asignar';
  }

  back(): void {
    this.router.navigate(['/home']);
  }
}
