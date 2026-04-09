import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { KeyFilterModule } from 'primeng/keyfilter';
import { MessageService } from 'primeng/api';

import {
  password10WithSymbol,
  onlyAdult,
  matchPass
} from '../../../components/validators/simple.validators';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    CardModule, InputTextModule, ButtonModule,
    ToastModule, CalendarModule, KeyFilterModule
  ],
  providers: [MessageService],
  templateUrl: './register.html'
})
export class Register {
  private fb     = inject(FormBuilder);
  private http   = inject(HttpClient);
  private router = inject(Router);
  private msg    = inject(MessageService);

  loading = false;
  showPassword = false;
  showConfirm  = false;

  form = this.fb.group(
    {
      username:        ['', [Validators.required, Validators.minLength(3)]],
      email:           ['', [Validators.required, Validators.email]],
      fullName:        ['', Validators.required],
      address:         ['', Validators.required],
      phone:           ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      birthdate:       [null as Date | null, [Validators.required, onlyAdult]],
      password:        ['', [Validators.required, password10WithSymbol]],
      confirmPassword: ['', Validators.required]
    },
    { validators: matchPass }
  );

  togglePassword(): void { this.showPassword = !this.showPassword; }
  toggleConfirm():  void { this.showConfirm  = !this.showConfirm; }

  limitTo10(controlName: string): void {
    const control = this.form.get(controlName);
    if (!control) return;
    const value = String(control.value ?? '');
    if (value.length > 10) control.setValue(value.slice(0, 10), { emitEvent: false });
  }

  c(name: string) { return this.form.get(name); }

  async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.msg.add({ severity: 'warn', summary: 'Validación', detail: 'Revisa los campos del formulario' });
      return;
    }

    this.loading = true;
    const v = this.form.getRawValue();

    try {
      await firstValueFrom(
        this.http.post(`${environment.apiGatewayUrl}/auth/register`, {
          username:  v.username,
          email:     v.email,
          fullName:  v.fullName,
          address:   v.address,
          phone:     v.phone,
          birthdate: v.birthdate ? new Date(v.birthdate).toISOString().split('T')[0] : '',
          password:  v.password
        })
      );

      this.msg.add({ severity: 'success', summary: 'Registro', detail: 'Cuenta creada correctamente' });
      this.form.reset();
      this.router.navigate(['/auth/login']);
    } catch {
      this.msg.add({ severity: 'error', summary: 'Registro', detail: 'El usuario o correo ya existe' });
    } finally {
      this.loading = false;
    }
  }
}