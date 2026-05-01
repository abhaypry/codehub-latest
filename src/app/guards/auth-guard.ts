import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../services/auth';

/**
 * Auth Guard
 * Protects routes so only logged-in users can access them
 * If user not logged in, redirects to /login page
 *
 * Used on protected routes like: dashboard, courses, lessons, quiz, leaderboard, profile
 * Not used on public routes like: home, login, register
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Check if user is logged in (user data exists in localStorage)
  if (auth.isLoggedIn()) {
    return true; // User logged in → allow access to route
  }

  // User not logged in → redirect to login page and block access
  router.navigate(['/login']);
  return false;
};
