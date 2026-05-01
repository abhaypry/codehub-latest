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

/**
 * App Routes
 * URL routing for all pages
 * Public routes (no auth): /, /login, /register
 * Protected routes (auth required): all others
 * authGuard redirects to /login if user not logged in
 */
export const routes: Routes = [
  // ====== PUBLIC ROUTES (No auth required) ======
  { path: '', component: Home }, // Landing page
  { path: 'login', component: Login }, // Login form
  { path: 'register', component: Register }, // Registration form

  // ====== PROTECTED ROUTES (Require login) ======
  { path: 'choose', component: Choose, canActivate: [authGuard] }, // Course selection after signup
  { path: 'learn', component: Dashboard, canActivate: [authGuard] }, // Main dashboard with winding lesson path
  { path: 'courses', component: Courses, canActivate: [authGuard] }, // Browse all courses
  { path: 'courses/:id/lessons', component: Lessons, canActivate: [authGuard] }, // List lessons in course
  { path: 'lessons/:id/quiz', component: Quiz, canActivate: [authGuard] }, // Multiple-choice quiz
  { path: 'lessons/:id/learn', component: LessonLearn, canActivate: [authGuard] }, // Interactive lesson
  { path: 'leaderboard', component: Leaderboard, canActivate: [authGuard] }, // Global user rankings
  { path: 'quests', component: Quests, canActivate: [authGuard] }, // Daily/weekly challenges
  { path: 'profile', component: Profile, canActivate: [authGuard] }, // User profile + achievements

  // ====== REDIRECTS ======
  { path: 'dashboard', redirectTo: 'learn' }, // Old route name
  { path: '**', redirectTo: '' } // 404 → home
];
