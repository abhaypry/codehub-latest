import { Component, OnInit } from '@angular/core';
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

  constructor(private api: Api, private auth: Auth, private router: Router) {}

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
  }

  startCourse(course: any) {
    const userId = this.auth.getUser()?.id;
    if (!userId) { this.router.navigate(['/login']); return; }

    this.starting = course.id;

    // Enroll if not already, then go to /learn with this course selected
    this.api.enrollCourses(userId, [course.id]).subscribe({
      next: () => {
        // Store full course object so dashboard can show it instantly
        this.auth.setCache('preferred_course_' + userId, course);
        this.router.navigate(['/learn']);
      },
      error: () => {
        this.starting = null;
      }
    });
  }
}
