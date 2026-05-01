import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';

/**
 * Register / Sign Up Page Component
 * Public page (no auth required)
 * User enters name + email + password, backend creates account, saves session
 */
@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  // Form input fields
  name = '';
  email = '';
  password = '';
  error = ''; // Error message shown to user
  loading = false; // Loading spinner while submitting

  constructor(private api: Api, private auth: Auth, private router: Router, private cdr: ChangeDetectorRef) {}

  /**
   * Handle registration form submission
   * 1. Validate all fields filled + password length
   * 2. Send to backend via api.register()
   * 3. If success: save user to localStorage and go to course selection page
   * 4. If error: show error message
   */
  submit() {
    this.error = '';

    // Validate form: all fields required
    if (!this.name || !this.email || !this.password) {
      this.error = 'Please fill in all fields.';
      return;
    }

    // Validate password: at least 6 characters for security
    if (this.password.length < 6) {
      this.error = 'Password must be at least 6 characters.';
      return;
    }

    // Show loading spinner
    this.loading = true;

    // Call backend register endpoint
    this.api.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success) {
          // Success: save user session + go to course selection
          this.auth.setUser(res.user);
          this.router.navigate(['/choose']);
        } else {
          // Registration failed: show error from backend (e.g., "Email already used")
          this.error = res.message;
          this.cdr.detectChanges();
        }
      },
      error: () => {
        // Network error: server unreachable
        this.loading = false;
        this.error = 'Something went wrong. Please try again.';
        this.cdr.detectChanges();
      }
    });
  }
}
