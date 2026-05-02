# CodeHub — Duolingo for Programming

> A gamified coding learning platform with XP, streaks, hearts, and a leaderboard.

![Angular](https://img.shields.io/badge/Angular-17+-DD0031?style=flat-square&logo=angular)
![PHP](https://img.shields.io/badge/Backend-PHP-777BB4?style=flat-square&logo=php)
![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?style=flat-square&logo=mysql)
![XAMPP](https://img.shields.io/badge/Server-XAMPP-FB7A24?style=flat-square&logo=apache)

---

## What is CodeHub?

CodeHub teaches programming languages through bite-sized lessons and multiple-choice quizzes — just like Duolingo, but for tech. Users earn XP, maintain streaks, spend hearts (lives) on wrong answers, and compete on a leaderboard.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17+ (TypeScript, standalone components) |
| Backend | PHP REST API |
| Database | MySQL via phpMyAdmin |
| Local Server | XAMPP (Apache + MySQL) |
| Fonts | Google Fonts — Nunito |

---

## Features

- **Lesson path** — Winding S-curve dashboard with `done`, `active`, and `locked` nodes
- **Quiz system** — Multiple-choice questions with immediate feedback
- **Hearts (lives)** — 5 hearts max; lose 1 per wrong answer; 0 hearts blocks the quiz
- **XP & Levels** — Earn XP on quiz completion; level up as XP grows
- **Streaks** — Daily login streak tracked and displayed in the navbar
- **Leaderboard** — Top 10 users ranked by XP with podium for top 3
- **Profile** — User stats, rank, level, and earned badges
- **Auth** — Register/login with session stored in localStorage

---

## Project Structure

```
codehub/                          ← Angular frontend (this repo)
└── src/
    ├── styles.css                ← Global styles + CSS variables
    └── app/
        ├── app.routes.ts         ← All routes
        ├── app.config.ts         ← HttpClient, Router providers
        ├── guards/
        │   └── auth-guard.ts     ← Redirects to /login if not logged in
        ├── services/
        │   ├── api.ts            ← All HTTP calls to PHP backend
        │   └── auth.ts           ← localStorage session + hearts system
        ├── shared/
        │   └── navbar/           ← Top sticky navbar (streak, XP, hearts)
        └── pages/
            ├── home/             ← Public landing page
            ├── login/
            ├── register/
            ├── dashboard/        ← Winding lesson path
            ├── courses/          ← All courses grid
            ├── lessons/          ← Lessons for a course
            ├── quiz/             ← Quiz with hearts system
            ├── leaderboard/      ← Top users by XP
            └── profile/          ← User stats and badges

C:/xampp/htdocs/codehub-api/      ← PHP backend (not in this repo)
    ├── config.php                ← DB connection + CORS
    ├── register.php
    ├── login.php
    ├── get_courses.php
    ├── get_lessons.php
    ├── get_quiz.php
    ├── save_progress.php
    ├── get_leaderboard.php
    ├── get_profile.php
    └── update_hearts.php
```

---

## Database Schema

```sql
-- MySQL database: codehub
users          (id, name, email, password, xp, streak, hearts, hearts_last_refill, last_active, created_at)
courses        (id, title, description, icon, color)
lessons        (id, course_id, title, content, order_num, xp_reward)
quiz_questions (id, lesson_id, question, option_a, option_b, option_c, option_d, correct_option)
user_progress  (id, user_id, lesson_id, completed, score, completed_at)
```

---

## Routes

| Path | Page | Auth Required |
|---|---|---|
| `/` | Home | No |
| `/login` | Login | No |
| `/register` | Register | No |
| `/dashboard` | Dashboard | Yes |
| `/courses` | Courses | Yes |
| `/courses/:id/lessons` | Lessons | Yes |
| `/lessons/:id/quiz` | Quiz | Yes |
| `/leaderboard` | Leaderboard | Yes |
| `/profile` | Profile | Yes |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Angular CLI](https://angular.dev/tools/cli) — `npm install -g @angular/cli`
- [XAMPP](https://www.apachefriends.org/) with Apache and MySQL

### 1. Backend Setup

1. Start **XAMPP Control Panel** → start **Apache** and **MySQL**
2. Copy the `codehub-api/` folder to `C:/xampp/htdocs/codehub-api/`
3. Open [phpMyAdmin](http://localhost/phpmyadmin) → create database `codehub`
4. Import the SQL schema and seed data

### 2. Frontend Setup

```bash
# Navigate to the project
cd "E:/College 8/codehub"

# Install dependencies
npm install

# Start dev server
ng serve
```

Open [http://localhost:4200](http://localhost:4200)

### 3. API Base URL

```
http://localhost/codehub-api/
```

> CORS is configured in `config.php` to allow `http://localhost:4200`.

---

## Design System

| CSS Variable | Value | Usage |
|---|---|---|
| `--primary` | `#04e88d` | Neon green — brand color |
| `--bg` | `#1e1e1e` | VS Code dark background |
| `--bg2` | `#252526` | Card background |
| `--danger` | `#ff4b4b` | Hearts / wrong answer |
| `--warning` | `#ffc800` | Streak / fire color |

**Button classes:** `.btn-duo.btn-duo-primary` (3D green), `.btn-duo.btn-duo-outline`, `.btn-duo.btn-duo-danger`

---

## Author

**Abhay Prajapati** — College Project (2025–26)
