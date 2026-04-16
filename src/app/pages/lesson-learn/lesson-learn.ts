import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Api } from '../../services/api';
import { CHAPTERS_BY_COURSE } from './lesson-content';

export type StepType = 'show' | 'explain' | 'tap' | 'mcq' | 'fill' | 'rule' | 'error_fix' | 'final';

export interface Opt  { text: string; correct: boolean; }
export interface Step {
  type: StepType;
  title?:     string;
  code?:      string;
  label?:     string;
  points?:    string[];
  question?:  string;
  options?:   Opt[];
  blank?:     string;
  answer?:    string;
  rule?:      string;
  brokenCode?: string;
  task?:      string;
}
export interface Chapter {
  chapterNum: number;
  title: string;
  goal:  string;
  icon:  string;
  color: string;
  steps: Step[];
}


// ── Component ──────────────────────────────────────────────────────────────
@Component({
  selector: 'app-lesson-learn',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lesson-learn.html',
  styleUrl:    './lesson-learn.css'
})
export class LessonLearn implements OnInit {
  lessonId = 0;
  courseId = 0;
  chapter: Chapter | null = null;

  stepIndex = 0;
  answered  = false;
  selectedIdx: number | null = null;
  isCorrect = false;

  fillInput   = '';
  fillChecked = false;
  fillCorrect = false;

  noHearts  = false;
  finished  = false;
  xpEarned  = 20;
  countdown = 3;

  shakingIdx: number | null = null;
  showGuidebook = false;

  constructor(public auth: Auth, private api: Api,
              private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    if (this.auth.getHearts() === 0) { this.noHearts = true; return; }
    this.lessonId = +this.route.snapshot.paramMap.get('id')! || 1;
    this.courseId = +this.route.snapshot.queryParamMap.get('course_id')! || 1;
    const courseId = this.courseId;
    const orderNum = +this.route.snapshot.queryParamMap.get('order')! || 0;
    const chapters = CHAPTERS_BY_COURSE[courseId] ?? CHAPTERS_BY_COURSE[1];
    // Use order_num from DB (1-based) if available; fall back to lessonId-based index
    const idx = orderNum > 0
      ? Math.max(0, Math.min(orderNum - 1, chapters.length - 1))
      : Math.max(0, (this.lessonId - 1) % chapters.length);
    this.chapter = chapters[idx];
  }

  // ── Getters ────────────────────────────────────────────────────────
  get step(): Step        { return this.chapter!.steps[this.stepIndex]; }
  get isLast(): boolean   { return this.stepIndex === this.chapter!.steps.length - 1; }
  get progress(): number  {
    return ((this.stepIndex + 1) / this.chapter!.steps.length) * 100;
  }
  get heartsArr(): boolean[] {
    return Array(5).fill(0).map((_, i) => i < this.auth.getHearts());
  }
  get stepLabel(): string {
    const map: Record<StepType, string> = {
      show: 'LEARN', explain: 'UNDERSTAND', tap: 'TAP THE ANSWER',
      mcq: 'CHOOSE ONE', fill: 'FILL IN THE BLANK', rule: 'RULE',
      error_fix: 'FIX THE ERROR', final: 'CHALLENGE'
    };
    return map[this.step.type] || '';
  }
  get isPassive(): boolean {
    return ['show', 'explain', 'rule', 'final'].includes(this.step.type);
  }
  get canContinue(): boolean {
    const t = this.step.type;
    if (this.isPassive) return true;
    if (['tap', 'mcq', 'error_fix'].includes(t)) return this.answered;
    if (t === 'fill') return this.fillChecked;
    return false;
  }

  // ── Option select (tap / mcq / error_fix) ─────────────────────────
  select(i: number) {
    if (this.answered) return;
    this.selectedIdx = i;
    this.answered    = true;
    this.isCorrect   = !!this.step.options?.[i]?.correct;

    if (!this.isCorrect) {
      this.shakingIdx = i;
      setTimeout(() => { this.shakingIdx = null; }, 500);
      this.loseHeart();
    }
  }

  optClass(i: number): string {
    if (!this.answered) return '';
    const opt = this.step.options?.[i];
    if (opt?.correct) return 'opt-correct';
    if (i === this.selectedIdx && !opt?.correct) return 'opt-wrong';
    return '';
  }

  tapClass(i: number): string {
    if (!this.answered) return '';
    const opt = this.step.options?.[i];
    if (opt?.correct) return 'tap-correct';
    if (i === this.selectedIdx && !opt?.correct) return 'tap-wrong';
    return '';
  }

  // ── Fill ──────────────────────────────────────────────────────────
  checkFill() {
    if (this.fillChecked) return;
    this.fillChecked = true;
    const user = this.fillInput.trim().toLowerCase();
    const ans  = (this.step.answer || '').trim().toLowerCase();
    this.fillCorrect = user === ans;
    if (!this.fillCorrect) this.loseHeart();
  }

  retryFill() {
    this.fillChecked = false;
    this.fillInput   = '';
  }

  // ── Navigation ────────────────────────────────────────────────────
  next() {
    if (!this.canContinue) return;
    if (this.isLast) {
      this.completeLesson();
    } else {
      this.stepIndex++;
      this.answered    = false;
      this.selectedIdx = null;
      this.isCorrect   = false;
      this.fillInput   = '';
      this.fillChecked = false;
      this.fillCorrect = false;
    }
  }

  private completeLesson() {
    this.finished = true;
    const userId = this.auth.getUser()?.id;

    const goToLearn = () => {
      if (userId) {
        const cacheKey = 'lessons_' + this.courseId + '_' + userId;
        const cached = this.auth.getCache(cacheKey);
        if (cached?.length) {
          // Optimistically update this course's lesson cache so dashboard shows instantly
          const updated = cached.map((l: any) => {
            if (l.id === this.lessonId) return { ...l, completed: 1, state: 'done' };
            return l;
          });
          let activeDone = false;
          const restate = updated.map((l: any) => {
            if (l.completed === 1) return { ...l, state: 'done' };
            if (!activeDone) { activeDone = true; return { ...l, state: 'active' }; }
            return { ...l, state: 'locked' };
          });
          this.auth.setCache(cacheKey, restate);
        }
      }
      this.router.navigate(['/learn']);
    };

    this.startCountdown(goToLearn);

    if (!userId) return;

    this.api.saveProgress(userId, this.lessonId).subscribe({
      next: (res: any) => {
        if (res.success) {
          const user = this.auth.getUser();
          if (user) {
            user.xp = res.total_xp ?? user.xp;
            this.auth.setUser(user);
          }
          this.xpEarned = res.xp_earned ?? this.xpEarned;
        }
      },
      error: () => {}
    });
  }

  private startCountdown(onDone: () => void) {
    this.countdown = 3;
    const tick = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(tick);
        onDone();
      }
    }, 1000);
  }

  private loseHeart() {
    this.auth.decrementHearts();
    if (this.auth.getHearts() === 0) {
      // allow finishing current step but block next
    }
    const userId = this.auth.getUser()?.id;
    if (userId) this.api.deductHearts(userId).subscribe({ error: () => {} });
  }
}
