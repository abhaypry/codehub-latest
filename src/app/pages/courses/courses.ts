import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { getCourseIconUrl } from '../../utils/course-icons';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { Sidebar } from '../../shared/sidebar/sidebar';

/**
 * Courses / Browse Page Component
 * Protected page (login required)
 * Shows grid of all available courses (JavaScript, Python, HTML, CSS, etc.)
 * User can enroll in courses, which then appear on dashboard
 */
@Component({
  selector: 'app-courses',
  imports: [CommonModule, RouterLink, Sidebar],
  templateUrl: './courses.html',
  styleUrl: './courses.css'
})
export class Courses implements OnInit {
  courses: any[] = []; // All available courses
  starting: number | null = null; // Course ID currently enrolling (for loading state)
  enrolledIds: Set<number> = new Set(); // IDs of courses user already enrolled in
  enrolledLoaded = false; // Whether we've fetched enrolled courses from backend yet

  constructor(private api: Api, private auth: Auth, private router: Router, private cdr: ChangeDetectorRef) {}

  /**
   * Load page:
   * 1. Show cached courses immediately (instant load)
   * 2. Fetch fresh course list from backend
   * 3. Check which courses user has enrolled in
   */
  ngOnInit() {
    // Show cached courses instantly
    const cached = this.auth.getCache('courses');
    if (cached) this.courses = cached.map((c: any) => ({
      ...c, iconUrl: c.iconUrl || getCourseIconUrl(c.title) || getCourseIconUrl(c.icon || ''),
    }));

    // Fetch fresh course list
    this.api.getCourses().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.courses = (res.courses || []).map((c: any) => ({
            ...c,
            iconUrl: getCourseIconUrl(c.title) || getCourseIconUrl(c.icon || ''),
          }));
          this.auth.setCache('courses', this.courses);
        }
      },
      error: () => {}
    });

    // Check enrolled courses
    const userId = this.auth.getUser()?.id;
    if (userId) {
      // Show cached enrolled IDs immediately
      const cachedEnrolled: number[] = this.auth.getCache('enrolled_' + userId) || [];
      if (cachedEnrolled.length) {
        this.enrolledIds = new Set(cachedEnrolled);
        this.enrolledLoaded = true;
      }

      // Fetch fresh enrolled courses from backend
      this.api.getUserCourses(userId).subscribe({
        next: (res: any) => {
          if (res.success) {
            const ids = (res.courses || []).map((c: any) => Number(c.id));
            this.enrolledIds = new Set(ids);
            this.auth.setCache('enrolled_' + userId, ids);
            this.enrolledLoaded = true;
            this.cdr.detectChanges();
          }
        },
        error: () => { this.enrolledLoaded = true; }
      });
    } else {
      this.enrolledLoaded = true;
    }
  }

  isEnrolled(courseId: number): boolean {
    return this.enrolledIds.has(Number(courseId));
  }

  getCourseIcon(title: string): string {
    return getCourseIconUrl(title);
  }

  /**
   * User clicked "Start Course"
   * 1. Enroll in course (if not already)
   * 2. Go to dashboard with this course selected
   */
  startCourse(course: any) {
    const userId = this.auth.getUser()?.id;
    if (!userId) { this.router.navigate(['/login']); return; }

    this.starting = course.id;

    // Enroll if not already, then go to /learn with this course selected
    this.api.enrollCourses(userId, [course.id]).subscribe({
      next: () => {
        this.enrolledIds.add(Number(course.id));
        this.auth.setCache('preferred_course_' + userId, course);
        this.router.navigate(['/learn']);
      },
      error: () => {
        this.starting = null;
      }
    });
  }
}
