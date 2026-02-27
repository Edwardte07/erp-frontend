import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, CardModule, DividerModule, AvatarModule],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User {
profile = {
  username: 'Eduardo Duarte',
  email: 'edu@gmail.com',
  role: 'Administrador',
  phone: '4421234567',
  address: 'Querétaro, México',
  birthdate: '2007-09-27'
};
}