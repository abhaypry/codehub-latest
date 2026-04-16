import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Choose } from './pages/choose/choose';
import { Dashboard } from './pages/dashboard/dashboard';
import { Courses } from './pages/courses/courses';
import { Lessons } from './pages/lessons/lessons';
import { Quiz } from './pages/quiz/quiz';
import { LessonLearn } from './pages/lesson-learn/lesson-learn';
import { Leaderboard } from './pages/leaderboard/leaderboard';
import { Profile } from './pages/profile/profile';
import { Quests } from './pages/quests/quests';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'choose', component: Choose, canActivate: [authGuard] },
  { path: 'learn', component: Dashboard, canActivate: [authGuard] },
  { path: 'courses', component: Courses, canActivate: [authGuard] },
  { path: 'courses/:id/lessons', component: Lessons, canActivate: [authGuard] },
  { path: 'lessons/:id/quiz',  component: Quiz,        canActivate: [authGuard] },
  { path: 'lessons/:id/learn', component: LessonLearn, canActivate: [authGuard] },
  { path: 'leaderboard', component: Leaderboard, canActivate: [authGuard] },
  { path: 'quests', component: Quests, canActivate: [authGuard] },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
  { path: 'dashboard', redirectTo: 'learn' },
  { path: '**', redirectTo: '' }
];
