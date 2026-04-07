// ─── JSON Schema estándar de todos los microservicios ────────────────────────
export interface ApiResponse<T = unknown> {
  statusCode: number;
  intOpCode: number;
  data: T;
}

export interface LoginResponse {
  token: string;
  message: string;
  usuario: SessionUser;
}

// ─── Usuario ──────────────────────────────────────────────────────────────────
export type UserRole = 'superadmin' | 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  groupIds: string[];
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  groupIds: string[];
}

// ─── Grupo ────────────────────────────────────────────────────────────────────
export interface Group {
  id: string;
  name: string;
  description: string;
  userIds: string[];
}

// ─── Ticket ───────────────────────────────────────────────────────────────────
export type TicketStatus   = 'Pendiente' | 'En progreso' | 'Hecho' | 'Bloqueado';
export type TicketPriority = 'Alta' | 'Media' | 'Baja';

export interface TicketComment {
  id: string;
  userId: string;
  userName: string;
  message: string;
  createdAt: string;
}

export interface TicketHistory {
  id: string;
  action: string;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  groupId: string;
  title: string;
  description: string;
  status: TicketStatus;
  assignedToUserId: string | null;
  createdByUserId: string;
  priority: TicketPriority;
  createdAt: string;
  dueDate?: string | null;
  comments: TicketComment[];
  history: TicketHistory[];
}
