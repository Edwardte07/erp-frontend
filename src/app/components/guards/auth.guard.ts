import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../../services/auth';

export const authGuard: CanActivateFn = async () => {
  const auth   = inject(Auth);
  const router = inject(Router);

  // Si hay token pero el usuario en memoria es null, esperar a que cargue
  if (!auth.isLoggedIn()) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Si hay token pero todavía no cargó el usuario, recargar desde API
  if (!auth.getUser()) {
    try {
      await auth.refreshSession();
    } catch {
      router.navigate(['/auth/login']);
      return false;
    }
  }

  return true;
};
