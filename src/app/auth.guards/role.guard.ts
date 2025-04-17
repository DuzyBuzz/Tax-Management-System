import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';
import { map, take } from 'rxjs/operators';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getCurrentUser().pipe(
    take(1),
    map(user => {
      if (!user) {
        router.navigate(['/auth/login']);
        return false;
      }

      const isAdmin = user.email === environment.adminEmail;
      const requiredRole = route.data['role'];

      // Role checks
      if (requiredRole === 'admin' && isAdmin) return true;
      if (requiredRole === 'taxpayer' && !isAdmin) return true;

      // Redirect if unauthorized
      router.navigate(['/unauthorized']);
      return false;
    })
  );
};
