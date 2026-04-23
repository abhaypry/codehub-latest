import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { Sidebar } from '../../shared/sidebar/sidebar';

@Component({
  selector: 'app-lessons',
  imports: [CommonModule, RouterLink, Sidebar],
  templateUrl: './lessons.html',
  styleUrl: './lessons.css'
})
export class Lessons implements OnInit {
  loading = false;
  courseId = 1;
  lessons: any[] = [];

  constructor(private route: ActivatedRoute, private api: Api, private auth: Auth) {}

  ngOnInit() {
    this.courseId = +this.route.snapshot.paramMap.get('id')! || 1;
    this.loadLessons();
  }

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
