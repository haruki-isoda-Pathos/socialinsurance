import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

export const authGuard: CanActivateFn = () => {

  const auth = inject(Auth);
  const router = inject(Router);

  console.log('ghard currentuser=', auth.currentUser);
  if (auth.currentUser) {
    return true;
  }

  return router.createUrlTree(['/login']);
}; 