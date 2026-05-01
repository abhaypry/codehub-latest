import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { NexaRive } from '../../shared/nexa-rive/nexa-rive';
import { getCourseIconUrl } from '../../utils/course-icons';

/**
 * Choose Courses / Onboarding Page Component
 * Protected page (login required)
 * Multi-step wizard after registration:
 * 1. Select courses to enroll in
 * 2. Pick skill level (beginner/basics/experienced)
 * 3. Pick education type (student/university/professional/self-taught)
 * 4. Pick learning goal (daily time commitment)
 * 5. Enroll in selected courses → go to dashboard
 */
@Component({
  selector: 'app-choose',
  imports: [CommonModule, NexaRive],
  templateUrl: './choose.html',
  styleUrl: './choose.css'
})
export class Choose implements OnInit {
  // Wizard state
  step = 1; // Current step (1-8): 1=courses, 2-3=intros, 4=level, 5=edu, 6=goal, 7=confirm, 8=loading
  selectedIds: Set<number> = new Set(); // IDs of selected courses
  selectedLevel: string | null = null; // Skill level
  selectedEdu: string | null = null; // Education background
  selectedGoal: string | null = null; // Learning goal
  enrollmentError = ''; // Error message if enrollment fails

  courses: any[] = []; // All available courses

  levels = [
    { id: 'beginner',    icon: 'https://cdn-icons-png.flaticon.com/512/10473/10473329.png', label: 'Complete Beginner', sub: 'Never written a line of code' },
    { id: 'basics',      icon: 'https://cdn-icons-png.flaticon.com/512/10473/10473628.png', label: 'Know the Basics',   sub: 'Wrote a few programs before'  },
    { id: 'experienced', icon: 'https://cdn-icons-png.flaticon.com/512/10473/10473683.png', label: "I'm Experienced",   sub: 'Here to level up my skills'   },
  ];

  educations = [
    { id: 'school',       icon: 'https://cdn-icons-png.flaticon.com/512/2097/2097095.png',   label: 'School Student',      sub: 'Still in school or high school'  },
    { id: 'university',   icon: 'https://cdn-icons-png.flaticon.com/512/8089/8089284.png',   label: 'University / College', sub: 'Currently studying or graduated' },
    { id: 'professional', icon: 'https://cdn-icons-png.flaticon.com/512/10490/10490250.png', label: 'Working Professional', sub: 'Already in the industry'         },
    { id: 'selftaught',   icon: 'https://cdn-icons-png.flaticon.com/512/10473/10473447.png', label: 'Self-taught Learner',  sub: 'Learning on my own terms'        },
  ];

  goals = [
    { id: '5',  time: '5 min / day',  label: 'Casual'  },
    { id: '10', time: '10 min / day', label: 'Regular' },
    { id: '15', time: '15 min / day', label: 'Serious' },
    { id: '20', time: '20 min / day', label: 'Intense' },
  ];

  constructor(private router: Router, private route: ActivatedRoute, private api: Api, private auth: Auth, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const isAdding = this.route.snapshot.queryParamMap.get('add') === 'true';
    const userId = this.auth.getUser()?.id;
    if (userId && !isAdding) {
      this.api.getUserCourses(userId).subscribe({
        next: (res: any) => {
          if (res.success && res.courses?.length > 0) {
            this.router.navigate(['/learn']);
            return;
          }
          this.loadCourses();
        },
        error: () => this.loadCourses()
      });
    } else {
      this.loadCourses();
    }
  }

  private loadCourses() {
    this.api.getCourses().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.courses = (res.courses || []).map((c: any) => ({
            ...c,
            name:    c.title,
            iconUrl: getCourseIconUrl(c.title) || getCourseIconUrl(c.icon || ''),
            letter:  c.title?.[0] || '?',
          }));
          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });
  }

  toggleCourse(id: number) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else {
      this.selectedIds.add(id);
    }
  }

  isCourseSelected(id: number): boolean {
    return this.selectedIds.has(id);
  }

  selectLevel(id: string) { this.selectedLevel = id; }
  selectEdu(id: string)   { this.selectedEdu   = id; }
  selectGoal(id: string)  { this.selectedGoal  = id; }

  get surveyProgress() {
    if (this.step === 4) return 33;
    if (this.step === 5) return 66;
    if (this.step === 6) return 100;
    return 0;
  }

  back() {
    if (this.step === 8) return;
    if (this.step > 1) this.step--;
    else this.router.navigate(['/']);
  }

  goNext() {
    if      (this.step === 1 && this.selectedIds.size > 0)     this.step = 2;
    else if (this.step === 2)                                   this.step = 3;
    else if (this.step === 3)                                   this.step = 4;
    else if (this.step === 4 && this.selectedLevel !== null)    this.step = 5;
    else if (this.step === 5 && this.selectedEdu !== null)      this.step = 6;
    else if (this.step === 6 && this.selectedGoal !== null)     this.step = 7;
    else if (this.step === 7) {
      this.enrollCourses();
    }
  }

  private enrollCourses() {
    this.step = 8;
    const courseIds = Array.from(this.selectedIds);
    const userId = this.auth.getUser()?.id || 0;

    this.api.enrollCourses(userId, courseIds).subscribe({
      next: (res: any) => {
        if (res.success) {
          // Cache enrolled courses + pre-fetch lessons during loading animation
          const enrolledCourses = this.courses.filter(c => courseIds.includes(c.id));
          if (enrolledCourses.length > 0) {
            this.auth.setCache('dashboard_' + userId, { courses: enrolledCourses });
            this.auth.setCache('preferred_course_' + userId, enrolledCourses[0]);
            enrolledCourses.forEach(c => {
              this.api.getLessons(c.id, userId).subscribe({
                next: (r: any) => {
                  if (r.success) this.auth.setCache('lessons_' + c.id + '_' + userId, r.lessons || []);
                },
                error: () => {}
              });
            });
          }
          setTimeout(() => this.router.navigate(['/learn']), 2800);
        } else {
          this.enrollmentError = res.message || 'Enrollment failed';
          this.step = 7;
        }
      },
      error: () => {
        this.enrollmentError = 'Server error. Is XAMPP running?';
        this.step = 7;
      }
    });
  }
}
