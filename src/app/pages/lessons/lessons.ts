import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { Sidebar } from '../../shared/sidebar/sidebar';

/**
 * Lessons List Page Component
 * Protected page (login required)
 * Shows all lessons in a course (e.g., "Variables", "Loops", "Functions" for Python)
 * User clicks lesson to start quiz
 */
@Component({
  selector: 'app-lessons',
  imports: [CommonModule, RouterLink, Sidebar],
  templateUrl: './lessons.html',
  styleUrl: './lessons.css'
})
export class Lessons implements OnInit {
  loading = false; // Loading lessons from backend
  courseId = 1; // Which course we're viewing (from URL param)
  lessons: any[] = []; // List of lessons in this course

  constructor(private route: ActivatedRoute, private api: Api, private auth: Auth) {}

  /**
   * Load page:
   * 1. Get course ID from URL (/courses/123/lessons)
   * 2. Fetch lessons for that course from backend
   * 3. Show user completion status for each lesson
   */
  ngOnInit() {
    this.courseId = +this.route.snapshot.paramMap.get('id')! || 1;
    this.loadLessons();
  }

  // Fetch lessons from backend for current course
  private loadLessons() {
    this.loading = true;
    const userId = this.auth.getUser()?.id;
    this.api.getLessons(this.courseId, userId).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success) {
          this.lessons = res.lessons || [];
        }
      },
      error: () => {
        this.loading = false;
        console.error('Failed to load lessons');
      }
    });
  }
}
