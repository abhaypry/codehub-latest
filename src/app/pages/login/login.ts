import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email = '';
  password = '';
  error = '';
  loading = false;

  constructor(private api: Api, private auth: Auth, private router: Router) {}

  submit() {
    this.error = '';
    if (!this.email || !this.password) { this.error = 'Please fill in all fields.'; return; }
    this.loading = true;
    this.api.login({ email: this.email, password: this.password }).subscribe({
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
