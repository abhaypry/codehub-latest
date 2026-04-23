import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-courses',
  imports: [CommonModule, RouterLink, Sidebar],
  templateUrl: './courses.html',
  styleUrl: './courses.css'
})
export class Courses implements OnInit {
  courses: any[] = [];
  starting: number | null = null;
  enrolledIds: Set<number> = new Set();
  enrolledLoaded = false;

  constructor(private api: Api, private auth: Auth, private router: Router, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const cached = this.auth.getCache('courses');
    if (cached) this.courses = cached;

    this.api.getCourses().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.courses = res.courses || [];
          this.auth.setCache('courses', this.courses);
        }
      },
      error: () => {}
    });

    const userId = this.auth.getUser()?.id;
    if (userId) {
      const cachedEnrolled: number[] = this.auth.getCache('enrolled_' + userId) || [];
      if (cachedEnrolled.length) {
        this.enrolledIds = new Set(cachedEnrolled);
        this.enrolledLoaded = true;
      }

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
