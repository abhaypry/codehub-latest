import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

const STORAGE_KEY = 'codehub_user';

@Injectable({ providedIn: 'root' })
export class Auth {
  constructor(private router: Router) {}

  getUser(): any {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  setUser(user: any): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.router.navigate(['/']);
  }

  updateUserCache(user: any): void {
    this.setUser(user);
  }

  getHearts(): number {
    return this.getUser()?.hearts ?? 5;
  }

  updateXP(xp: number): void {
    const user = this.getUser();
    if (user) {
      user.xp = xp;
      this.setUser(user);
    }
  }

  decrementHearts(): void {
    const user = this.getUser();
    if (user && user.hearts > 0) {
      user.hearts -= 1;
      this.setUser(user);
    }
  }

  refillHearts(): void {
    const user = this.getUser();
    if (user) {
      user.hearts = 5;
      this.setUser(user);
    }
  }

  // ── Simple localStorage cache for page data ──
  setCache(key: string, data: any): void {
    if (data === null || data === undefined) {
      localStorage.removeItem(`codehub_cache_${key}`);
    } else {
      localStorage.setItem(`codehub_cache_${key}`, JSON.stringify(data));
    }
  }

  getCache(key: string): any {
    const raw = localStorage.getItem(`codehub_cache_${key}`);
    return raw ? JSON.parse(raw) : null;
  }
}
