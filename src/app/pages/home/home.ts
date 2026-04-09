import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';
import { SelectButtonModule } from 'primeng/selectbutton';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';

import { Auth } from '../../services/auth';
import { GroupService } from '../../services/group.service';
import { TicketService } from '../../services/ticket.service';
import { PermissionsService } from '../../services/permissions.service';
import {
  Group, SessionUser, Ticket,
  TicketPriority, TicketStatus, User
} from '../../../models/app.models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    CardModule, ButtonModule, TagModule, DropdownModule,
    SelectButtonModule, DialogModule, InputTextModule,
    InputTextareaModule, DividerModule, ToastModule, TableModule,
    ChartModule
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  private auth            = inject(Auth);
  private ticketService   = inject(TicketService);
  private groupService    = inject(GroupService);
  private permisosService = inject(PermissionsService);
  private router          = inject(Router);
  private msg             = inject(MessageService);

  currentUser: SessionUser | null = null;
  myGroups:    Group[]  = [];
  allTickets:  Ticket[] = [];
  users:       User[]   = [];
  groupUsers:  User[]   = [];
  loading = false;

  selectedGroupId: string | null = null;
  selectedStatus: 'Todos' | TicketStatus = 'Todos';
  viewMode: 'lista' | 'kanban' = 'kanban';

  showCreateTicketModal = false;
  showDetailTicketModal = false;
  selectedTicket: Ticket | null = null;
  newComment = '';

  draggedTicketId: string | null = null;
  draggedOverStatus: TicketStatus | null = null;

  searchText = '';
  selectedPriority: TicketPriority | null = null;
  selectedAssignedUserId: string | null = null;
  createdFrom: string | null = null;
  createdTo:   string | null = null;

  form = {
    groupId:          null as string | null,
    title:            '',
    description:      '',
    status:           'Pendiente' as TicketStatus,
    assignedToUserId: null as string | null,
    priority:         'Media' as TicketPriority,
    dueDate:          null as string | null
  };

  viewOptions     = [{ label: 'Lista', value: 'lista' }, { label: 'Kanban', value: 'kanban' }];
  statusOptions   = ['Pendiente', 'En progreso', 'Hecho', 'Bloqueado'];
  priorityOptions = ['Alta', 'Media', 'Baja'];
  priorityFilterOptions = [
    { label: 'Todas', value: null },
    { label: 'Alta',  value: 'Alta'  as TicketPriority },
    { label: 'Media', value: 'Media' as TicketPriority },
    { label: 'Baja',  value: 'Baja'  as TicketPriority }
  ];

  chartOptions = {
    plugins: { legend: { position: 'bottom' } },
    responsive: true,
    maintainAspectRatio: false
  };

  get assignedFilterOptions(): { name: string; id: string | null }[] {
    return [
      { name: 'Todos', id: null },
      ...this.groupUsers.map(u => ({ name: u.name, id: u.id }))
    ];
  }

  get chartDataEstado() {
    return {
      labels: ['Pendiente', 'En progreso', 'Hecho', 'Bloqueado'],
      datasets: [{
        data: [this.pendingCount, this.progressCount, this.doneCount, this.blockedCount],
        backgroundColor: ['#FFA726', '#42A5F5', '#66BB6A', '#EF5350']
      }]
    };
  }

  get chartDataPrioridad() {
    const alta  = this.filteredTickets.filter(t => t.priority === 'Alta').length;
    const media = this.filteredTickets.filter(t => t.priority === 'Media').length;
    const baja  = this.filteredTickets.filter(t => t.priority === 'Baja').length;
    return {
      labels: ['Alta', 'Media', 'Baja'],
      datasets: [{
        label: 'Tickets por prioridad',
        data: [alta, media, baja],
        backgroundColor: ['#EF5350', '#FFA726', '#66BB6A']
      }]
    };
  }

  async ngOnInit(): Promise<void> {
    await this.auth.refreshSession();
    this.currentUser = this.auth.getUser();

    if (!this.currentUser) { this.router.navigate(['/auth/login']); return; }

    await this.permisosService.cargar(this.currentUser);

    this.loading = true;
    try {
      const [groups, users] = await Promise.all([
        this.groupService.getGroupsByUser(this.currentUser.id),
        this.groupService.getAllUsers()
      ]);

      this.myGroups = groups;
      this.users    = users;

      if (this.myGroups.length) {
        this.selectedGroupId = this.myGroups[0].id;
        this.form.groupId    = this.myGroups[0].id;
        this.updateGroupUsers();
      }

      await this.loadTickets();
    } catch {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar la información' });
    } finally {
      this.loading = false;
    }
  }

  async loadTickets(): Promise<void> {
    if (!this.currentUser) return;
    try {
      const tickets = await this.ticketService.getTicketsByGroupIds(this.currentUser.groupIds);

      // Si es usuario normal, solo ver sus tickets asignados
      if (this.currentUser.role === 'user') {
        this.allTickets = tickets.filter(t => 
          t.assignedToUserId === this.currentUser!.id
        );
      } else {
        // superadmin ven todos
        this.allTickets = tickets;
      }
    } catch {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudieron cargar los tickets' });
    }
  }

  get filteredTickets(): Ticket[] {
    let tickets = [...this.allTickets];
    if (this.selectedGroupId !== null)
      tickets = tickets.filter(t => t.groupId === this.selectedGroupId);
    if (this.selectedStatus !== 'Todos')
      tickets = tickets.filter(t => t.status === this.selectedStatus);
    if (this.selectedPriority !== null)
      tickets = tickets.filter(t => t.priority === this.selectedPriority);
    if (this.selectedAssignedUserId !== null)
      tickets = tickets.filter(t => t.assignedToUserId === this.selectedAssignedUserId);
    if (this.searchText.trim()) {
      const text = this.searchText.toLowerCase();
      tickets = tickets.filter(t =>
        t.title.toLowerCase().includes(text) ||
        t.description.toLowerCase().includes(text)
      );
    }
    if (this.createdFrom) {
      const from = new Date(this.createdFrom); from.setHours(0,0,0,0);
      tickets = tickets.filter(t => new Date(t.createdAt) >= from);
    }
    if (this.createdTo) {
      const to = new Date(this.createdTo); to.setHours(23,59,59,999);
      tickets = tickets.filter(t => new Date(t.createdAt) <= to);
    }
    return tickets;
  }

  get totalTickets()    { return this.filteredTickets.length; }
  get pendingCount()    { return this.filteredTickets.filter(t => t.status === 'Pendiente').length; }
  get progressCount()   { return this.filteredTickets.filter(t => t.status === 'En progreso').length; }
  get doneCount()       { return this.filteredTickets.filter(t => t.status === 'Hecho').length; }
  get blockedCount()    { return this.filteredTickets.filter(t => t.status === 'Bloqueado').length; }
  get pendingTickets()  { return this.filteredTickets.filter(t => t.status === 'Pendiente'); }
  get progressTickets() { return this.filteredTickets.filter(t => t.status === 'En progreso'); }
  get doneTickets()     { return this.filteredTickets.filter(t => t.status === 'Hecho'); }
  get blockedTickets()  { return this.filteredTickets.filter(t => t.status === 'Bloqueado'); }

  filterByStatus(status: 'Todos' | TicketStatus): void { this.selectedStatus = status; }

  clearExtraFilters(): void {
    this.searchText             = '';
    this.selectedPriority       = null;
    this.selectedAssignedUserId = null;
    this.createdFrom            = null;
    this.createdTo              = null;
  }

  canCreateTicket(): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'superadmin') return true;
    const permisos = this.permisosService.getPermisos();
    const tieneGlobal = permisos.some(p => p.nombre === 'ticket:add' && p.grupo_id === null);
    if (tieneGlobal) return true;
    if (this.selectedGroupId) {
      return permisos.some(p => p.nombre === 'ticket:add' && p.grupo_id === this.selectedGroupId);
    }
    return false;
  }

  canEditTicket(): boolean {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'superadmin') return true;
    const permisos = this.permisosService.getPermisos();
    const tieneGlobal = permisos.some(p => p.nombre === 'ticket:edit' && p.grupo_id === null);
    if (tieneGlobal) return true;
    if (this.selectedGroupId) {
      return permisos.some(p => p.nombre === 'ticket:edit' && p.grupo_id === this.selectedGroupId);
    }
    return false;
  }

  async onGroupChange(): Promise<void> {
    this.selectedStatus         = 'Todos';
    this.form.groupId           = this.selectedGroupId;
    this.form.assignedToUserId  = null;
    this.selectedAssignedUserId = null;
    this.updateGroupUsers();
  }

  updateGroupUsers(): void {
    if (!this.form.groupId) { this.groupUsers = []; return; }
    const group = this.myGroups.find(g => g.id === this.form.groupId);
    this.groupUsers = group
      ? this.users.filter(u => group.userIds.includes(u.id))
      : [];
  }

  openCreateTicketModal(): void {
    if (!this.canCreateTicket()) return;
    this.form = {
      groupId: this.selectedGroupId,
      title: '', description: '',
      status: 'Pendiente', assignedToUserId: null,
      priority: 'Media', dueDate: null
    };
    this.updateGroupUsers();
    this.showCreateTicketModal = true;
  }

  async saveTicket(): Promise<void> {
    if (!this.currentUser || !this.form.groupId || !this.form.title.trim()) return;
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
      this.showCreateTicketModal = false;
      await this.loadTickets();
      this.msg.add({ severity: 'success', summary: 'OK', detail: 'Ticket creado' });
    } catch {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo crear el ticket' });
    }
  }

  openTicketDetail(ticket: Ticket): void {
    this.selectedTicket = JSON.parse(JSON.stringify(ticket));
    this.newComment = '';
    this.showDetailTicketModal = true;
  }

  async saveTicketDetail(): Promise<void> {
    if (!this.selectedTicket || !this.currentUser) return;
    try {
      await this.ticketService.updateTicket(this.selectedTicket);
      this.showDetailTicketModal = false;
      await this.loadTickets();
      this.msg.add({ severity: 'success', summary: 'OK', detail: 'Ticket actualizado' });
    } catch {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el ticket' });
    }
  }

  async addComment(): Promise<void> {
    if (!this.selectedTicket || !this.currentUser || !this.newComment.trim()) return;
    try {
      await this.ticketService.addComment(
        this.selectedTicket.id,
        this.selectedTicket.groupId,
        {
          userId:    this.currentUser.id,
          userName:  this.currentUser.name,
          message:   this.newComment,
          createdAt: new Date().toISOString()
        }
      );
      this.newComment = '';
      const updated = await this.ticketService.getTicketById(this.selectedTicket.id);
      this.selectedTicket = updated;
      await this.loadTickets();
    } catch {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo agregar el comentario' });
    }
  }

  onDragStart(event: DragEvent, ticket: Ticket): void {
    if (!this.canEditTicket()) { event.preventDefault(); return; }
    this.draggedTicketId = ticket.id;
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', ticket.id);
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  onDragOver(event: DragEvent, status: TicketStatus): void {
    event.preventDefault();
    this.draggedOverStatus = status;
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
  }

  onDragLeave(): void { this.draggedOverStatus = null; }

  async onDrop(event: DragEvent, newStatus: TicketStatus): Promise<void> {
    event.preventDefault();
    if (!this.canEditTicket()) { this.draggedTicketId = null; this.draggedOverStatus = null; return; }
    const ticketId = event.dataTransfer?.getData('text/plain') || this.draggedTicketId;
    if (!ticketId) { this.draggedTicketId = null; this.draggedOverStatus = null; return; }
    const ticket = this.allTickets.find(t => t.id === ticketId);
    if (!ticket || ticket.status === newStatus) { this.draggedTicketId = null; this.draggedOverStatus = null; return; }
    try {
      await this.ticketService.updateStatus(ticket.groupId, ticket.id, newStatus);
      await this.loadTickets();
    } catch {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cambiar el estado' });
    } finally {
      this.draggedTicketId   = null;
      this.draggedOverStatus = null;
    }
  }

  getAssignedUserName(userId: string | null): string {
    if (!userId) return 'Sin asignar';
    return this.users.find(u => u.id === userId)?.name || 'Sin asignar';
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