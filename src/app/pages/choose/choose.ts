import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../shared/navbar/navbar';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { NexaRive } from '../../shared/nexa-rive/nexa-rive';

@Component({
  selector: 'app-choose',
  imports: [CommonModule, Navbar, NexaRive],
  templateUrl: './choose.html',
  styleUrl: './choose.css'
})
export class Choose implements OnInit {
  step = 1;
  selectedIds: Set<number> = new Set();
  selectedLevel: string | null = null;
  selectedEdu:   string | null = null;
  selectedGoal:  string | null = null;
  enrollmentError = '';

  courses: any[] = [];

  levels = [
    { id: 'beginner',    emoji: '🍎', label: 'Complete Beginner', sub: 'Never written a line of code' },
    { id: 'basics',      emoji: '🎓', label: 'Know the Basics',   sub: 'Wrote a few programs before'  },
    { id: 'experienced', emoji: '🧠', label: "I'm Experienced",   sub: 'Here to level up my skills'   },
  ];

  educations = [
    { id: 'school',       emoji: '🍎', label: 'School Student',      sub: 'Still in school or high school'  },
    { id: 'university',   emoji: '🎓', label: 'University / College', sub: 'Currently studying or graduated' },
    { id: 'professional', emoji: '💼', label: 'Working Professional', sub: 'Already in the industry'         },
    { id: 'selftaught',   emoji: '🧠', label: 'Self-taught Learner',  sub: 'Learning on my own terms'        },
  ];

  goals = [
    { id: '5',  time: '5 min / day',  label: 'Casual'  },
    { id: '10', time: '10 min / day', label: 'Regular' },
    { id: '15', time: '15 min / day', label: 'Serious' },
    { id: '20', time: '20 min / day', label: 'Intense' },
  ];

  constructor(private router: Router, private api: Api, private auth: Auth) {}

  ngOnInit() {
    this.api.getCourses().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.courses = (res.courses || []).map((c: any) => ({
            ...c,
            name:     c.title,
            lang:     c.icon,
            fontSize: this.iconFontSize(c.icon),
          }));
        }
      },
      error: () => {}
    });
  }

  private iconFontSize(icon: string): string {
    if (!icon) return '28px';
    const len = [...icon].length; // handle emoji (multi-byte)
    if (len === 1) return '34px';
    if (len === 2) return '28px';
    return '22px';
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
