import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { Auth } from '../../services/auth';
import { GroupService } from '../../services/group.service';
import { TicketService } from '../../services/ticket.service';
import { Group, SessionUser, TicketPriority, TicketStatus, User } from '../../../models/app.models';

@Component({
  selector: 'app-create-ticket',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    CardModule, ButtonModule, DropdownModule,
    InputTextModule, InputTextareaModule, ToastModule
  ],
  templateUrl: './create-ticket.html',
  styleUrls: ['./create-ticket.css']
})
export class CreateTicket implements OnInit {
  private auth          = inject(Auth);
  private groupService  = inject(GroupService);
  private ticketService = inject(TicketService);
  private router        = inject(Router);
  private msg           = inject(MessageService);

  currentUser: SessionUser | null = null;
  groups:     Group[] = [];
  users:      User[]  = [];
  groupUsers: User[]  = [];
  loading = false;

  form = {
    groupId:          null as string | null,
    title:            '',
    description:      '',
    status:           'Pendiente' as TicketStatus,
    assignedToUserId: null as string | null,
    priority:         'Media' as TicketPriority,
    dueDate:          null as string | null
  };

  statusOptions   = ['Pendiente', 'En progreso', 'Hecho', 'Bloqueado'];
  priorityOptions = ['Alta', 'Media', 'Baja'];

  async ngOnInit(): Promise<void> {
    this.currentUser = this.auth.getUser();
    if (!this.currentUser) { this.router.navigate(['/auth/login']); return; }

    const canCreate = this.currentUser.role === 'superadmin' ||
      this.currentUser.permissions.includes('ticket:add');

    if (!canCreate) { this.router.navigate(['/home']); return; }

    this.loading = true;
    try {
      const [groups, users] = await Promise.all([
        this.groupService.getGroupsByUser(this.currentUser.id),
        this.groupService.getAllUsers()
      ]);
      this.groups = groups;
      this.users  = users;

      if (this.groups.length) {
        this.form.groupId = this.groups[0].id;
        this.updateGroupUsers();
      }
    } catch {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar los datos' });
    } finally {
      this.loading = false;
    }
  }

  onGroupChange(): void {
    this.form.assignedToUserId = null;
    this.updateGroupUsers();
  }

  updateGroupUsers(): void {
    if (!this.form.groupId) { this.groupUsers = []; return; }
    const group = this.groups.find(g => g.id === this.form.groupId);
    this.groupUsers = group
      ? this.users.filter(u => group.userIds.includes(u.id))
      : [];
  }

  async saveTicket(): Promise<void> {
    if (!this.currentUser || !this.form.groupId || !this.form.title.trim()) return;

    this.loading = true;
    try {
      await this.ticketService.createTicket({
        groupId:          this.form.groupId,
        title:            this.form.title,
        description:      this.form.description,
        status:           this.form.status,
        assignedToUserId: this.form.assignedToUserId,
        createdByUserId:  this.currentUser.id,
        priority:         this.form.priority,
        dueDate:          this.form.dueDate,
        comments:         [],
        history:          []
      });
      this.msg.add({ severity: 'success', summary: 'OK', detail: 'Ticket creado correctamente' });
      this.router.navigate(['/home']);
    } catch {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el ticket' });
    } finally {
      this.loading = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/home']);
  }
}
