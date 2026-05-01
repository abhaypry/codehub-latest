import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { Api } from '../../services/api';

/**
 * Quiz Page Component
 * Protected page (login required)
 * Shows multiple-choice quiz questions one at a time
 * - Deducts heart if wrong answer
 * - Blocks quiz if 0 hearts
 * - Awards XP if quiz passed
 */
@Component({
  selector: 'app-quiz',
  imports: [CommonModule, RouterLink],
  templateUrl: './quiz.html',
  styleUrl: './quiz.css'
})
export class Quiz implements OnInit {
  // State
  loading    = false; // Loading quiz questions
  submitting = false; // Submitting quiz (checking answers)
  noHearts   = false; // User has 0 hearts → quiz blocked
  finished   = false; // Quiz submitted, show results screen
  error      = ''; // Error message

  // Quiz data
  lessonId  = 0; // Which lesson this quiz is for
  current   = 0; // Currently displayed question index
  selected: string | null = null; // User's selected option for current question
  answered  = false; // User has selected an answer (move to next)

  questions: any[] = []; // All quiz questions
  answers: Record<number, string> = {}; // User's answers (question ID → selected option)

  quizResult = { passed: false, score: 0, correct: 0, total: 0, xpEarned: 0 }; // Results after submission

  constructor(public auth: Auth, private api: Api, private route: ActivatedRoute, private router: Router) {}

  /**
   * Initialize quiz
   * 1. Check if user has hearts (0 hearts = blocked)
   * 2. Get lesson ID from URL (/quiz/123)
   * 3. Load quiz questions from backend
   */
  ngOnInit() {
    if (this.auth.getHearts() === 0) { this.noHearts = true; return; }
    this.lessonId = +this.route.snapshot.paramMap.get('id')! || 1;
    this.loadQuestions();
  }

  // Fetch quiz questions for this lesson from backend
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

  // Current question being displayed
  get question()    { return this.questions[this.current]; }
  // Quiz progress percentage (how many questions done)
  get progress()    { return this.questions.length ? ((this.current + 1) / this.questions.length) * 100 : 0; }
  // Array for hearts display: [true, true, false, false, false] for 2 hearts
  get heartsArray() { return Array(5).fill(0).map((_, i) => i < this.auth.getHearts()); }
  // Check if on last question
  get isLast()      { return this.current === this.questions.length - 1; }

  /**
   * User selected an answer option
   * 1. Save selection
   * 2. Mark as answered (can't change)
   * 3. Can now move to next question
   */
  select(opt: string) {
    if (this.answered) return;
    this.selected = opt;
    this.answers[this.question.id] = opt;
    this.answered = true;
  }

  /**
   * Move to next question or submit quiz
   * - If not last: show next question
   * - If last: submit all answers and show results
   */
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
