import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

// Key used to store logged-in user data in browser's localStorage
const STORAGE_KEY = 'codehub_user';

/**
 * Auth Service
 * Manages user login session, hearts (lives), XP, and simple data caching.
 * All data stored in browser's localStorage so it persists when page reloads.
 */
@Injectable({ providedIn: 'root' })
export class Auth {
  constructor(private router: Router) {}

  // ====== USER SESSION MANAGEMENT ======

  /**
   * Get currently logged-in user from localStorage
   * Returns: User object (id, name, email, xp, hearts, streak, etc.) or null if not logged in
   */
  getUser(): any {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  /**
   * Save user data to localStorage
   * Called after login or when user stats update (XP, hearts, etc.)
   */
  setUser(user: any): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }

  /**
   * Check if user is currently logged in
   * Returns: true if user data exists in localStorage, false otherwise
   */
  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  /**
   * Log out user: delete from localStorage and redirect to home page
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.router.navigate(['/']);
  }

  /**
   * Update cached user data in localStorage
   * Used when backend returns updated user info (after quiz, hearts refill, etc.)
   */
  updateUserCache(user: any): void {
    this.setUser(user);
  }

  // ====== HEARTS SYSTEM (Lives) ======

  /**
   * Get current user's heart count
   * Returns: Number of hearts (0-5). Default 5 if user not loaded yet
   */
  getHearts(): number {
    return this.getUser()?.hearts ?? 5;
  }

  /**
   * Remove 1 heart when user answers quiz question wrong
   * Heart count decreases: 5 → 4 → 3 → 2 → 1 → 0 (quiz blocked)
   */
  decrementHearts(): void {
    const user = this.getUser();
    if (user && user.hearts > 0) {
      user.hearts -= 1;
      this.setUser(user);
    }
  }

  /**
   * Refill hearts back to 5 (max)
   * Called when user clicks "Refill Hearts" button or after daily reset
   */
  refillHearts(): void {
    const user = this.getUser();
    if (user) {
      user.hearts = 5;
      this.setUser(user);
    }
  }

  // ====== XP (Experience Points) ======

  /**
   * Update user's total XP after completing a quiz
   * XP increases rank/level and moves user up on leaderboard
   */
  updateXP(xp: number): void {
    const user = this.getUser();
    if (user) {
      user.xp = xp;
      this.setUser(user);
    }
  }

  // ====== SIMPLE DATA CACHE ======
  // Used to temporarily store page data (courses, lessons, etc.) to avoid re-fetching

  /**
   * Save data to browser cache with a given key
   * If data is null/undefined, removes it from cache instead
   */
  setCache(key: string, data: any): void {
    if (data === null || data === undefined) {
      localStorage.removeItem(`codehub_cache_${key}`);
    } else {
      localStorage.setItem(`codehub_cache_${key}`, JSON.stringify(data));
    }
  }

  /**
   * Get cached data by key
   * Returns: Stored data or null if not found in cache
   */
  getCache(key: string): any {
    const raw = localStorage.getItem(`codehub_cache_${key}`);
    return raw ? JSON.parse(raw) : null;
  }
}
