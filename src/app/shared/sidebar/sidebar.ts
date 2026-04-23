import { Component, OnInit, AfterViewInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css'
})
export class Sidebar implements OnInit, AfterViewInit {
  readonly avatarBase = '/assets/';
  avatarError = false;

  constructor(private auth: Auth, private router: Router) {}

  ngOnInit() {
    const color = localStorage.getItem('codehub_theme_color');
    const dark  = localStorage.getItem('codehub_theme_color_dark');
    if (color) document.body.style.setProperty('--course-color', color);
    if (dark)  document.body.style.setProperty('--course-color-dark', dark);
  }

  ngAfterViewInit() {
    requestAnimationFrame(() => {
      document.body.classList.add('nav-ready');
    });
  }

  get user() { return this.auth.getUser(); }

  onAvatarError() { this.avatarError = true; }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
