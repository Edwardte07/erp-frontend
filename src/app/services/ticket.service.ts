import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Ticket, TicketComment } from '../../models/app.models';
import { environment } from '../../environments/environment';

const GW = environment.apiGatewayUrl;

@Injectable({ providedIn: 'root' })
export class TicketService {
  private http = inject(HttpClient);

  getAllTickets(): Promise<Ticket[]> {
    return firstValueFrom(this.http.get<Ticket[]>(`${GW}/tickets`));
  }

  getTicketsByGroupIds(groupIds: string[]): Promise<Ticket[]> {
    const ids = groupIds.join(',');
    return firstValueFrom(this.http.get<Ticket[]>(`${GW}/tickets?groupIds=${ids}`));
  }

  getTicketsByGroup(groupId: string): Promise<Ticket[]> {
    return firstValueFrom(this.http.get<Ticket[]>(`${GW}/groups/${groupId}/tickets`));
  }

  getTicketById(ticketId: string): Promise<Ticket> {
    return firstValueFrom(this.http.get<Ticket>(`${GW}/tickets/${ticketId}`));
  }

  createTicket(ticket: Omit<Ticket, 'id' | 'createdAt'>): Promise<Ticket> {
    return firstValueFrom(
      this.http.post<Ticket>(`${GW}/groups/${ticket.groupId}/tickets`, ticket)
    );
  }

  updateTicket(ticket: Ticket): Promise<Ticket> {
    return firstValueFrom(
      this.http.put<Ticket>(`${GW}/groups/${ticket.groupId}/tickets/${ticket.id}`, ticket)
    );
  }

  updateStatus(groupId: string, ticketId: string, status: string): Promise<Ticket> {
    return firstValueFrom(
      this.http.patch<Ticket>(`${GW}/groups/${groupId}/tickets/${ticketId}`, { status })
    );
  }

  deleteTicket(groupId: string, ticketId: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${GW}/groups/${groupId}/tickets/${ticketId}`)
    );
  }

  addComment(ticketId: string, groupId: string, comment: Omit<TicketComment, 'id'>): Promise<Ticket> {
    return firstValueFrom(
      this.http.post<Ticket>(`${GW}/groups/${groupId}/tickets/${ticketId}/comments`, comment)
    );
  }
}
