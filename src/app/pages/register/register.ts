import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  name = '';
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private api: Api, private auth: Auth, private router: Router) {}

  submit() {
    this.error = '';
    if (!this.name || !this.email || !this.password) { this.error = 'Please fill in all fields.'; return; }
    if (this.password.length < 6) { this.error = 'Password must be at least 6 characters.'; return; }
    this.loading = true;
    this.api.register({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success) {
          this.auth.setUser(res.user);
          this.router.navigate(['/dashboard']);
        } else {
          this.error = res.message;
        }
      },
      error: () => { this.loading = false; this.error = 'Server error. Is XAMPP running?'; }
    });
  }
}
