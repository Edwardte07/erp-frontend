import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { User } from '../../models/app.models';
import { environment } from '../../environments/environment';

const GW = environment.apiGatewayUrl;

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getAllUsers(): Promise<User[]> {
    return firstValueFrom(this.http.get<User[]>(`${GW}/users`));
  }

  getUserById(userId: string): Promise<User> {
    return firstValueFrom(this.http.get<User>(`${GW}/users/${userId}`));
  }

  createUser(user: Omit<User, 'id'>): Promise<User> {
    return firstValueFrom(this.http.post<User>(`${GW}/users`, user));
  }

  updateUser(user: User): Promise<User> {
    return firstValueFrom(this.http.put<User>(`${GW}/users/${user.id}`, user));
  }

  deleteUser(userId: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${GW}/users/${userId}`));
  }

  addPermission(userId: string, permission: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${GW}/users/${userId}/permissions`, { permission })
    );
  }

  removePermission(userId: string, permission: string): Promise<void> {
    return firstValueFrom(
      this.http.delete<void>(`${GW}/users/${userId}/permissions/${permission}`)
    );
  }

  setPermissions(userId: string, permissions: string[]): Promise<void> {
    return firstValueFrom(
      this.http.put<void>(`${GW}/users/${userId}/permissions`, { permissions })
    );
  }
}
