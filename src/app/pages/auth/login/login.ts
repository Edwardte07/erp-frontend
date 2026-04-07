import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterModule,
    CardModule, InputTextModule, ButtonModule, ToastModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  private fb     = inject(FormBuilder);
  private auth   = inject(Auth);
  private router = inject(Router);
  private msg    = inject(MessageService);

  loading      = false;
  showPassword = false;

  form = this.fb.group({
    userOrEmail: ['', Validators.required],
    password:    ['', [Validators.required, Validators.maxLength(10)]]
  });

  ngOnInit(): void {}

  c(name: 'userOrEmail' | 'password') {
    return this.form.get(name)!;
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.msg.add({ severity: 'warn', summary: 'Validación', detail: 'Completa usuario y contraseña' });
      return;
    }

    this.loading = true;
    try {
      const ok = await this.auth.login(
        this.form.value.userOrEmail!,
        this.form.value.password!
      );

      if (!ok) {
        this.msg.add({ severity: 'error', summary: 'Login', detail: 'Credenciales incorrectas' });
        return;
      }

      this.msg.add({ severity: 'success', summary: '¡Bienvenido!', detail: 'Inicio de sesión exitoso' });
      await new Promise(r => setTimeout(r, 1000));
      this.router.navigate(['/home']);

    } catch {
      this.msg.add({ severity: 'error', summary: 'Error', detail: 'No se pudo conectar al servidor' });
    } finally {
      this.loading = false;
    }
  }
}