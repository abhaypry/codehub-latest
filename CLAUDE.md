# CodeHub — Project Reference for Claude

## What is CodeHub?
CodeHub is a **Duolingo-style coding learning platform** built as a college project by **Abhay Prajapati**. Users learn programming languages through bite-sized lessons, multiple-choice quizzes, XP rewards, streaks, hearts (lives), and a leaderboard. Think Duolingo but for tech/programming.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular (TypeScript) — standalone components, Angular 17+ control flow (`@if`, `@for`) |
| Backend | PHP (REST API) |
| Database | MySQL via phpMyAdmin |
| Local server | XAMPP (Apache + MySQL) |
| Fonts | Google Fonts — Nunito |

**Never suggest switching to React, Next.js, Node.js, or any other stack. Always use Angular + PHP + MySQL.**

---

## Project Folder Structure

```
E:/College 8/codehub-Final/
└── codehub/                        ← Angular frontend
    └── src/
        ├── styles.css              ← Global styles + CSS variables
        └── app/
            ├── app.routes.ts       ← All routes
            ├── app.config.ts       ← HttpClient, Router providers
            ├── guards/
            │   └── auth-guard.ts   ← Redirects to /login if not logged in
            ├── services/
            │   ├── api.ts          ← All HTTP calls to PHP backend
            │   └── auth.ts         ← localStorage user session + hearts system
            ├── shared/
            │   └── navbar/         ← Top sticky navbar (used on all pages)
            └── pages/
                ├── home/           ← Public landing page
                ├── login/          ← Login form
                ├── register/       ← Register form
                ├── dashboard/      ← Winding lesson path (main page after login)
                ├── courses/        ← Grid of all courses
                ├── lessons/        ← Lesson list for a course
                ├── quiz/           ← Quiz with hearts system
                ├── leaderboard/    ← Top users by XP
                └── profile/        ← User stats, level, badges

C:/xampp/htdocs/codehub-api/        ← PHP backend
    ├── config.php                  ← DB connection + CORS headers
    ├── register.php                ← POST: create user
    ├── login.php                   ← POST: login + streak update
    ├── get_courses.php             ← GET: all courses
    ├── get_lessons.php             ← GET: lessons by course_id
    ├── get_quiz.php                ← GET: questions by lesson_id
    ├── save_progress.php           ← POST: save quiz result + award XP
    ├── get_leaderboard.php         ← GET: top 10 users by XP
    ├── get_profile.php             ← GET: user stats + rank
    └── update_hearts.php           ← POST: lose or refill hearts
```

---

## Routes

| Path | Component | Auth required |
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

## Database Schema (MySQL — `codehub` database)

```sql
users          (id, name, email, password, xp, streak, hearts, hearts_last_refill, last_active, created_at)
courses        (id, title, description, icon, color)
lessons        (id, course_id, title, content, order_num, xp_reward)
quiz_questions (id, lesson_id, question, option_a, option_b, option_c, option_d, correct_option)
user_progress  (id, user_id, lesson_id, completed, score, completed_at)
```

---

## Color Theme (CSS Variables in `styles.css`)

```css
--primary:       #04e88d   /* neon green — main brand color */
--primary-dark:  #02c077   /* darker green — 3D button shadow */
--primary-light: rgba(4,232,141,0.12)  /* green tint for backgrounds */
--bg:            #1e1e1e   /* VS Code dark — main background */
--bg2:           #252526   /* VS Code sidebar — card background */
--bg3:           #2d2d2d   /* VS Code input — nested elements */
--border:        #3e3e42   /* VS Code panel border */
--text:          #ffffff
--text-muted:    #9eb3be
--danger:        #ff4b4b
--danger-dark:   #ea2b2b
--warning:       #ffc800   /* streak/fire color */
--hearts:        #ff4b4b
```

**The background is VS Code's exact dark theme (#1e1e1e). Never change this.**

---

## Design Rules (Duolingo-style)

1. **3D buttons** — use `.btn-duo` class with `box-shadow: 0 4px 0 var(--primary-dark)`. On click: `translateY(4px)` + shadow removed.
2. **Card borders** — cards use `border-bottom: 4-5px solid var(--border)` for depth effect.
3. **Font** — Nunito, weights 700/800/900. Bold and chunky everywhere.
4. **Neon green** is the ONLY primary color. No purple, no blue as primary.
5. **Navigation** — Top sticky navbar (not bottom). Shows streak 🔥, XP ⚡, hearts ❤️ when logged in.
6. **Lesson path** — Winding S-curve on Dashboard with nodes: `done` (green ✓), `active` (pulsing green ▶), `locked` (grey 🔒).
7. **Hearts system** — 5 hearts max. Lose 1 per wrong quiz answer. 0 hearts = quiz blocked.
8. **Uppercase labels** — nav links, badges, form labels are `text-transform: uppercase`.

---

## Button Classes

| Class | Usage |
|---|---|
| `.btn-duo.btn-duo-primary` | Main CTA — neon green with 3D shadow |
| `.btn-duo.btn-duo-outline` | Secondary — outlined neon green |
| `.btn-duo.btn-duo-danger` | Wrong answer / destructive — red |
| `.btn-duo.btn-duo-grey` | Disabled/neutral |
| `.btn.btn-primary` | Smaller inline actions |
| `.btn.btn-outline` | Smaller secondary actions |

---

## Auth System

- User session stored in **localStorage** key: `codehub_user`
- Auth service (`services/auth.ts`) methods: `getUser()`, `setUser()`, `isLoggedIn()`, `logout()`, `updateXP()`, `getHearts()`, `decrementHearts()`, `refillHearts()`
- `authGuard` redirects unauthenticated users to `/login`

---

## Key Rules for Claude

1. **Frontend only changes** — when user says "build frontend", do NOT touch PHP files.
2. **Dummy data** — all pages currently have hardcoded dummy data in `.ts` files for UI preview. When connecting to real backend, swap dummy data with API calls from `api.ts`.
3. **Angular standalone** — all components use `imports: [...]` directly (no NgModule). Always add required imports like `CommonModule`, `RouterLink`, `FormsModule` etc. in the component's `imports` array.
4. **Control flow** — use Angular 17+ syntax: `@if`, `@for`, `@else` — NOT `*ngIf`, `*ngFor`.
5. **Curly braces in templates** — literal `{` and `}` in HTML must be written as `{{ '{' }}` and `{{ '}' }}` to avoid Angular ICU parse errors.
6. **No new pages without asking** — don't create new routes/pages unless user requests.
7. **XAMPP must be running** for backend to work — Apache + MySQL both started.
8. **PHP CORS** — `config.php` sets `Access-Control-Allow-Origin: http://localhost:4200`.

---

## Current Status

- ✅ Landing page (home)
- ✅ Login / Register (connected to PHP backend)
- ✅ Dashboard with winding lesson path
- ✅ Courses page
- ✅ Lessons page
- ✅ Quiz with hearts system
- ✅ Leaderboard with podium
- ✅ Profile page
- ✅ Navbar with streak/XP/hearts
- ✅ PHP REST API (all endpoints)
- ✅ MySQL database with sample data
- ⏳ Real API connection (currently using dummy data in components)
- ⏳ Hearts synced with backend
- ⏳ User progress tracked from DB

---

## Running the Project

**Backend:** Open XAMPP Control Panel → Start Apache + MySQL

**Frontend:**
```bash
cd "E:/College 8/codehub-Final/codehub"
ng serve
```
Open: `http://localhost:4200`

**Database:** `http://localhost/phpmyadmin` → select `codehub` database

**API base URL:** `http://localhost/codehub-api/`
