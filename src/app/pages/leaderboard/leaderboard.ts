import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-leaderboard',
  imports: [CommonModule, Navbar],
  templateUrl: './leaderboard.html',
  styleUrl: './leaderboard.css'
})
export class Leaderboard {
  loading = false;
  userId = 1;

  leaderboard = [
    { id: 2, rank: 1, name: 'Roshan Kumar',   xp: 1840, streak: 32 },
    { id: 3, rank: 2, name: 'Priya Sharma',   xp: 1520, streak: 21 },
    { id: 4, rank: 3, name: 'Dev Patel',       xp: 1190, streak: 14 },
    { id: 1, rank: 4, name: 'Abhay Prajapati', xp:  340, streak:  7 },
    { id: 5, rank: 5, name: 'Sneha Joshi',     xp:  290, streak:  5 },
    { id: 6, rank: 6, name: 'Rahul Verma',     xp:  210, streak:  3 },
    { id: 7, rank: 7, name: 'Ankit Singh',     xp:  150, streak:  2 },
    { id: 8, rank: 8, name: 'Neha Gupta',      xp:   90, streak:  1 },
  ];

  constructor(private auth: Auth) {
    this.userId = this.auth.getUser()?.id || 1;
  }
}
