import { Component, Input, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {
  @Input() forcePublic = false;
  user: any = null;

  constructor(public auth: Auth, private router: Router) {}

  ngOnInit() {
    this.user = this.auth.getUser();
  }

  logout() {
    this.auth.logout();
    this.user = null;
  }

  get hearts() { return this.auth.getHearts(); }
  get heartsArray() { return Array(5).fill(0).map((_, i) => i < this.hearts); }
}
