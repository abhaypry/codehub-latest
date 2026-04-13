import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { Courses } from './pages/courses/courses';
import { Lessons } from './pages/lessons/lessons';
import { Quiz } from './pages/quiz/quiz';
import { Leaderboard } from './pages/leaderboard/leaderboard';
import { Profile } from './pages/profile/profile';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: Dashboard, canActivate: [authGuard] },
  { path: 'courses', component: Courses, canActivate: [authGuard] },
  { path: 'courses/:id/lessons', component: Lessons, canActivate: [authGuard] },
  { path: 'lessons/:id/quiz', component: Quiz, canActivate: [authGuard] },
  { path: 'leaderboard', component: Leaderboard, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
