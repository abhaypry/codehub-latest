import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Api } from '../../services/api';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, UpperCasePipe, RouterLink, Sidebar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  user: any = null;
  userRank = 0;

  noCoursesEnrolled = false;
  coursesLoading = true;
  lessonsLoading = true;
  private userPickedCourse = false;
  private preferredCourseId: number | null = null;

  constructor(private auth: Auth, private api: Api, private router: Router, private cdr: ChangeDetectorRef) {}

  courses: any[] = [];
  selectedCourse: any = null;
  pathNodes: any[] = [];
  showCoursePopup = false;
  showGuidebook   = false;
  showProPopup    = false;
  trialLoading    = false;
  trialSuccess    = false;
  trialEndsAt     = '';

  private positions = ['center', 'right', 'center', 'left', 'center', 'right', 'center', 'left'];

  ngOnInit() {
    this.user = this.auth.getUser();

    // Restore saved theme immediately (no flicker on page change)
    const savedColor = localStorage.getItem('codehub_theme_color');
    const savedDark  = localStorage.getItem('codehub_theme_color_dark');
    if (savedColor) document.body.style.setProperty('--course-color', savedColor);
    if (savedDark)  document.body.style.setProperty('--course-color-dark', savedDark);

    // Read & clear preferred course set by courses page (full course object)
    const preferredCourse = this.auth.getCache('preferred_course_' + this.user?.id);
    if (preferredCourse) {
      this.auth.setCache('preferred_course_' + this.user?.id, null);
      this.selectedCourse = {
        ...preferredCourse,
        colorDark: preferredCourse.colorDark || this.getDarkColor(preferredCourse.color)
      };
      this.preferredCourseId = preferredCourse.id;
      this.applyThemeColor(this.selectedCourse);
      this.loadCourseLessons(this.selectedCourse.id);
    }

    // Show cached courses immediately (banner + tabs always ready)
    const cached = this.auth.getCache('dashboard_' + this.user?.id);
    if (cached?.courses?.length > 0) {
      this.courses = cached.courses;
      this.coursesLoading = false;
      if (!this.selectedCourse) {
        const c = this.pickDefaultCourse(cached.courses);
        this.selectedCourse = { ...c, colorDark: c.colorDark || this.getDarkColor(c.color) };
        this.applyThemeColor(this.selectedCourse);
        this.loadCourseLessons(this.selectedCourse.id);
      }
    }

    // Fetch real rank from profile
    this.api.getProfile(this.user?.id || 0).subscribe({
      next: (res: any) => { if (res.success) this.userRank = res.user?.rank || 0; },
      error: () => {}
    });

    // Fetch fresh enrolled courses from DB
    this.api.getUserCourses(this.user?.id || 0).subscribe({
      next: (res: any) => {
        if (res.success) {
          const freshCourses = (res.courses || []).map((c: any) => ({
            ...c,
            colorDark: c.colorDark || this.getDarkColor(c.color)
          }));

          if (freshCourses.length > 0) {
            this.courses = freshCourses;
            this.coursesLoading = false;
            this.noCoursesEnrolled = false;
            this.auth.setCache('dashboard_' + this.user?.id, { courses: freshCourses });

            // Pre-fetch lessons for all courses not yet cached (background, no UI effect)
            freshCourses.forEach((c: any) => {
              const key = 'lessons_' + c.id + '_' + this.user?.id;
              if (!this.auth.getCache(key)) {
                this.api.getLessons(c.id, this.user?.id).subscribe({
                  next: (r: any) => {
                    if (r.success) this.auth.setCache(key, r.lessons || []);
                  },
                  error: () => {}
                });
              }
            });

            if (!this.userPickedCourse && !this.selectedCourse) {
              this.selectedCourse = this.pickDefaultCourse(freshCourses);
              this.applyThemeColor(this.selectedCourse);
              this.loadCourseLessons(this.selectedCourse.id);
            } else if (this.selectedCourse) {
              // Refresh colorDark from fresh data in case it changed
              const fresh = freshCourses.find((c: any) => c.id === this.selectedCourse.id);
              if (fresh) { this.selectedCourse = fresh; this.applyThemeColor(fresh); }
            }
          } else {
            this.coursesLoading = false;
            this.noCoursesEnrolled = true;
            this.auth.setCache('dashboard_' + this.user?.id, null);
          }
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.coursesLoading = false;
        if (!cached?.courses?.length) this.noCoursesEnrolled = true;
        this.cdr.detectChanges();
      }
    });
  }

  selectCourse(course: any) {
    if (!course.colorDark) {
      course.colorDark = this.getDarkColor(course.color);
    }
    this.selectedCourse = course;
    this.applyThemeColor(course);
    this.showCoursePopup = false;
    this.userPickedCourse = true;
    this.pathNodes = [];
    this.auth.setCache('last_course_' + this.user?.id, course.id);
    this.loadCourseLessons(course.id);
  }

  private loadCourseLessons(courseId: number) {
    // Show cached lessons for this course instantly
    const lessonCache = this.auth.getCache('lessons_' + courseId + '_' + this.user?.id);
    if (lessonCache?.length) {
      this.buildPath(lessonCache);
      this.lessonsLoading = false;
    } else {
      this.lessonsLoading = true;
    }

    this.api.getLessons(courseId, this.user?.id).subscribe({
      next: (res: any) => {
        if (this.selectedCourse?.id !== courseId) return;
        if (res.success) {
          const lessons = res.lessons || [];
          this.buildPath(lessons);
          this.auth.setCache('lessons_' + courseId + '_' + this.user?.id, lessons);
        }
        this.lessonsLoading = false;
      },
      error: () => { this.lessonsLoading = false; }
    });
  }

  private pickDefaultCourse(courses: any[]): any {
    const lastId = this.auth.getCache('last_course_' + this.user?.id);
    if (lastId) {
      const found = courses.find(c => c.id === lastId);
      if (found) return found;
    }
    return courses[0];
  }

  private getDarkColor(lightColor: string): string {
    const colorMap: Record<string, string> = {
      '#04e88d': '#02a864',
      '#7b68ee': '#5a4bc4',
      '#ffc800': '#b38900',
      '#ff6b6b': '#cc4444',
      '#61dafb': '#1a5c8a',
      '#3572a5': '#1e4d7a',
      '#4a90e2': '#2060b0',
      '#4a90d9': '#2060b0',
      '#5b9bd5': '#2060b0',
      '#2980b9': '#1a5c8a',
      '#1a6fa8': '#0d3d6b',
      '#e34c26': '#b03000',
      '#f7df1e': '#b89a00',
      '#3776ab': '#1e4d7a',
      '#00add8': '#007a9e',
      '#b07219': '#7a4e00',
    };
    return colorMap[lightColor.toLowerCase()] || this.darkenColor(lightColor);
  }

  private darkenColor(hex: string): string {
    const c = hex.replace('#', '');
    const r = Math.max(0, parseInt(c.slice(0,2), 16) - 60);
    const g = Math.max(0, parseInt(c.slice(2,4), 16) - 60);
    const b = Math.max(0, parseInt(c.slice(4,6), 16) - 60);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }

  private applyThemeColor(course: any) {
    const color = course.color || '#04e88d';
    const dark  = course.colorDark || this.getDarkColor(color);
    document.body.style.setProperty('--course-color', color);
    document.body.style.setProperty('--course-color-dark', dark);
    localStorage.setItem('codehub_theme_color', color);
    localStorage.setItem('codehub_theme_color_dark', dark);
  }

  private buildPath(lessons: any[]) {
    this.pathNodes = lessons.map((l, i) => ({ ...l, pos: this.positions[i % 8] }));
  }

  getRoadPath(from: string, to: string): string {
    const x: Record<string, number> = { left: 110, center: 250, right: 390 };
    const fx = x[from] ?? 250;
    const tx = x[to] ?? 250;
    // Extend slightly so road meets node edge without overlapping
    if (fx === tx) return `M ${fx} 0 L ${tx} 100`;
    return `M ${fx} 0 C ${fx} 60 ${tx} 40 ${tx} 100`;
  }

  courseEmoji(icon: string): string {
    const map: Record<string, string> = {
      'c.png':      '⚙️',
      'cpp.png':    '🔷',
      'java.png':   '☕',
      'csharp.png': '🎯',
      'python.png': '🐍',
      'js.png':     '🟨',
      'html.png':   '🌐',
      'css.png':    '🎨',
    };
    return map[icon?.toLowerCase()] ?? '📘';
  }

  get level()     { return Math.floor((this.user?.xp || 0) / 100) + 1; }
  get xpInLevel() { return (this.user?.xp || 0) % 100; }

  get lessonsCompleted() {
    return this.pathNodes.filter(l => l.state === 'done').length;
  }
  get leaderboardProgress()  { return Math.min((this.lessonsCompleted / 10) * 100, 100); }
  get leaderboardNeeded()    { return Math.max(10 - this.lessonsCompleted, 0); }

  readonly dailyXpGoal  = 20;
  get dailyXp()         { return Math.min((this.user?.xp || 0) % this.dailyXpGoal, this.dailyXpGoal); }
  get dailyXpProgress() { return (this.dailyXp / this.dailyXpGoal) * 100; }

  get heartsArray() { return Array(5).fill(0).map((_, i) => i < (this.user?.hearts || 0)); }

  activateTrial() {
    if (this.trialLoading || this.trialSuccess) return;
    this.trialLoading = true;
    this.api.startTrial(this.user?.id || 0).subscribe({
      next: (res: any) => {
        this.trialLoading = false;
        if (res.success) {
          this.trialSuccess = true;
          const d = new Date(res.ends_at);
          this.trialEndsAt = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        }
      },
      error: () => { this.trialLoading = false; }
    });
  }
}
