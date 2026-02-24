import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';

import { Auth } from '../../../components/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,            
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    PasswordModule
  ],
  providers: [],
  templateUrl: './login.html'
})
export class Login {
  private fb = inject(FormBuilder);     
  private auth = inject(Auth);
  private router = inject(Router);
  private msg = inject(MessageService);

  form = this.fb.group({
    userOrEmail: ['', Validators.required],
    password: ['', Validators.required]
  });

  c(name: 'userOrEmail' | 'password') {
    return this.form.get(name)!;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.msg.add({ severity: 'warn', summary: 'Validación', detail: 'Completa usuario y contraseña' });
      return;
    }

    const ok = this.auth.login(this.form.value.userOrEmail!, this.form.value.password!);

    if (!ok) {
      this.msg.add({ severity: 'error', summary: 'Login', detail: 'Credenciales incorrectas' });
      return;
    }

    this.router.navigate(['/dashboard']);
  }
}