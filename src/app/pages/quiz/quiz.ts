import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Api } from '../../services/api';

@Component({
  selector: 'app-quiz',
  imports: [CommonModule, RouterLink],
  templateUrl: './quiz.html',
  styleUrl: './quiz.css'
})
export class Quiz implements OnInit {
  loading    = false;
  submitting = false;
  noHearts   = false;
  finished   = false;
  error      = '';

  lessonId  = 0;
  current   = 0;
  selected: string | null = null;
  answered  = false;

  questions: any[] = [];
  answers: Record<number, string> = {};

  quizResult = { passed: false, score: 0, correct: 0, total: 0, xpEarned: 0 };

  constructor(public auth: Auth, private api: Api, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    if (this.auth.getHearts() === 0) { this.noHearts = true; return; }
    this.lessonId = +this.route.snapshot.paramMap.get('id')! || 1;
    this.loadQuestions();
  }

  private loadQuestions() {
    this.loading = true;
    this.api.getQuiz(this.lessonId).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success) {
          this.questions = res.questions || [];
        } else {
          this.error = 'Failed to load quiz';
        }
      },
      error: () => { this.loading = false; this.error = 'Server error. Is XAMPP running?'; }
    });
  }

  get question()    { return this.questions[this.current]; }
  get progress()    { return this.questions.length ? ((this.current + 1) / this.questions.length) * 100 : 0; }
  get heartsArray() { return Array(5).fill(0).map((_, i) => i < this.auth.getHearts()); }
  get isLast()      { return this.current === this.questions.length - 1; }

  select(opt: string) {
    if (this.answered) return;
    this.selected = opt;
    this.answers[this.question.id] = opt;
    this.answered = true;
  }

  next() {
    if (!this.isLast) {
      this.current++;
      this.selected = this.answers[this.question.id] || null;
      this.answered = !!this.selected;
    } else {
      this.submitQuiz();
    }
  }

  private submitQuiz() {
    this.submitting = true;
    const userId = this.auth.getUser()?.id || 0;
    this.api.validateQuiz(userId, this.lessonId, this.answers).subscribe({
      next: (res: any) => {
        this.submitting = false;
        if (res.success) {
          this.quizResult = {
            passed:   res.passed,
            score:    res.score,
            correct:  res.correct,
            total:    res.total,
            xpEarned: res.xp_earned
          };
          this.finished = true;
          if (res.user) {
            const stored = this.auth.getUser();
            if (stored) this.auth.updateUserCache({ ...stored, ...res.user });
          }
        } else {
          this.error = res.message || 'Quiz submission failed';
        }
      },
      error: () => { this.submitting = false; this.error = 'Server error submitting quiz'; }
    });
  }
}
