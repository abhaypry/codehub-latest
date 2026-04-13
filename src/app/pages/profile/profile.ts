import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, Navbar],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  loading = false;
  profile = {
    name: 'Abhay Prajapati',
    email: 'abhay@example.com',
    xp: 340,
    streak: 7,
    completed_lessons: 3,
    rank: 4,
    created_at: '2024-01-15',
  };

  constructor(private auth: Auth) {
    const user = this.auth.getUser();
    if (user) {
      this.profile = {
        name: user.name || 'Abhay Prajapati',
        email: user.email || 'abhay@example.com',
        xp: user.xp || 340,
        streak: user.streak || 7,
        completed_lessons: 3,
        rank: 4,
        created_at: '2024-01-15',
      };
    }
  }

  get level()     { return Math.floor((this.profile.xp) / 100) + 1; }
  get xpInLevel() { return (this.profile.xp) % 100; }
  get joinDate()  {
    return new Date(this.profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
}
