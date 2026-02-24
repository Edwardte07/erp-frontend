import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { CalendarModule } from 'primeng/calendar';
import { KeyFilterModule } from 'primeng/keyfilter';
import { MessageService } from 'primeng/api';
import { PasswordModule } from 'primeng/password';

import { Auth } from '../../../components/services/auth';
import { password10WithSymbol, onlyAdult, matchPass } from '../../../components/validators/simple.validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    CalendarModule,
    KeyFilterModule,
    PasswordModule
  ],
  providers: [],
  templateUrl: './register.html'
})
export class Register {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);
  private msg = inject(MessageService);

  
  showPassword = false;
  showConfirm = false;

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirm() {
    this.showConfirm = !this.showConfirm;
  }

  form = this.fb.group({
    username: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    fullName: ['', Validators.required],
    address: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
    birthdate: [null, [Validators.required, onlyAdult]],
    password: ['', [Validators.required, password10WithSymbol]],
    confirmPassword: ['', Validators.required]
  }, { validators: matchPass });

  
  limitTo10(controlName: string) {
    const control = this.form.get(controlName);
    if (!control) return;

    const value = (control.value ?? '') as string;
    if (value.length > 10) {
      control.setValue(value.slice(0, 10), { emitEvent: false });
    }
  }

  c(name: string) {
    return this.form.get(name)!;
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.msg.add({ severity: 'warn', summary: 'Validación', detail: 'Revisa los campos' });
      return;
    }

    this.auth.register({
      username: this.form.value.username!,
      email: this.form.value.email!,
      password: this.form.value.password!
    });

    this.msg.add({ severity: 'success', summary: 'Registro', detail: 'Cuenta creada' });
    this.router.navigate(['/auth/login']);
  }
}