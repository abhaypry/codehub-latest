import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { Api } from '../../services/api';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-leaderboard',
  imports: [CommonModule, Sidebar],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css'
})
export class Leaderboard implements OnInit {
  userId = 0;
  leaderboard: any[] = [];
  readonly avatarBase = 'http://localhost/codehub-api/';

  constructor(private auth: Auth, private api: Api) {}

  ngOnInit() {
    const user = this.auth.getUser();
    if (user) this.userId = Number(user.id);

    // Show cached data immediately
    const cached = this.auth.getCache('leaderboard');
    if (cached) this.leaderboard = cached;

    // Fetch fresh in background
    this.api.getLeaderboard().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.leaderboard = res.leaderboard || [];
          this.auth.setCache('leaderboard', this.leaderboard);
        }
      },
      error: () => {}
    });
  }
}
