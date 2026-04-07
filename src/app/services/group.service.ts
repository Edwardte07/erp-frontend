import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Group, User } from '../../models/app.models';
import { environment } from '../../environments/environment';

const GW = environment.apiGatewayUrl;

@Injectable({ providedIn: 'root' })
export class GroupService {
  private http = inject(HttpClient);

  getAllGroups(): Promise<Group[]> {
    return firstValueFrom(this.http.get<Group[]>(`${GW}/groups`));
  }

  getGroupsByUser(userId: string): Promise<Group[]> {
    return firstValueFrom(this.http.get<Group[]>(`${GW}/groups?userId=${userId}`));
  }

  getGroupById(groupId: string): Promise<Group> {
    return firstValueFrom(this.http.get<Group>(`${GW}/groups/${groupId}`));
  }

  createGroup(name: string, description: string): Promise<Group> {
    return firstValueFrom(this.http.post<Group>(`${GW}/groups`, { name, description }));
  }

  updateGroup(group: Group): Promise<Group> {
    return firstValueFrom(this.http.put<Group>(`${GW}/groups/${group.id}`, group));
  }

  deleteGroup(groupId: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${GW}/groups/${groupId}`));
  }

  getGroupMembers(groupId: string): Promise<User[]> {
    return firstValueFrom(this.http.get<User[]>(`${GW}/groups/${groupId}/members`));
  }

  assignUsersToGroup(groupId: string, userIds: string[]): Promise<void> {
    return firstValueFrom(
      this.http.put<void>(`${GW}/groups/${groupId}/members`, { userIds })
    );
  }

  getAllUsers(): Promise<User[]> {
    return firstValueFrom(this.http.get<User[]>(`${GW}/users`));
  }

  getPermisosMiembro(groupId: string, userId: string): Promise<any[]> {
    return firstValueFrom(
      this.http.get<any[]>(`${GW}/groups/${groupId}/members/${userId}/permisos`)
    );
  }

  setPermisosMiembro(groupId: string, userId: string, permisos: string[]): Promise<void> {
    return firstValueFrom(
      this.http.put<void>(`${GW}/groups/${groupId}/members/${userId}/permisos`, {
        permiso_ids: permisos
      })
    );
  }
}