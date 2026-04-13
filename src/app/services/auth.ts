import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Auth {
  private key = 'codehub_user';

  getUser(): any {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : null;
  }

  setUser(user: any): void {
    if (!user.hearts && user.hearts !== 0) user.hearts = 5;
    localStorage.setItem(this.key, JSON.stringify(user));
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.key);
  }

  logout(): void {
    localStorage.removeItem(this.key);
  }

  updateXP(xp: number, streak: number): void {
    const user = this.getUser();
    if (user) { user.xp = xp; user.streak = streak; this.setUser(user); }
  }

  getHearts(): number {
    return this.getUser()?.hearts ?? 5;
  }

  decrementHearts(): number {
    const user = this.getUser();
    if (user) {
      user.hearts = Math.max(0, (user.hearts ?? 5) - 1);
      this.setUser(user);
      return user.hearts;
    }
    return 0;
  }

  refillHearts(): void {
    const user = this.getUser();
    if (user) { user.hearts = 5; this.setUser(user); }
  }
}
