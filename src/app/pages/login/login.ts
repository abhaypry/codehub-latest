import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';

/**
 * Login Page Component
 * Public page (no auth required)
 * User enters email + password, backend validates, saves session to localStorage
 */
@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  // Form input fields
  email = '';
  password = '';
  error = ''; // Shows error message to user
  loading = false; // Shows loading spinner while submitting

  constructor(private api: Api, private auth: Auth, private router: Router, private cdr: ChangeDetectorRef) {}

  /**
   * Handle login form submission
   * 1. Validate email + password not empty
   * 2. Send to backend via api.login()
   * 3. If success: save user to localStorage and go to dashboard
   * 4. If error: show error message
   */
  submit() {
    this.error = '';

    // Validate form
    if (!this.email || !this.password) {
      this.error = 'Please fill in all fields.';
      return;
    }

    // Show loading spinner
    this.loading = true;

    // Call backend login endpoint
    this.api.login({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success) {
          // Success: save user session + redirect to dashboard
          this.auth.setUser(res.user);
          this.router.navigate(['/dashboard']);
        } else {
          // Login failed: show error from backend
          this.error = res.message || 'Invalid email or password.';
          this.cdr.detectChanges();
        }
      },
      error: () => {
        // Network error: server unreachable
        this.loading = false;
        this.error = 'Cannot connect to server. Is XAMPP running?';
        this.cdr.detectChanges();
      }
    });
  }
}
