import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Auth } from '../../services/auth';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-quiz',
  imports: [CommonModule, RouterLink, Navbar],
  templateUrl: './quiz.html',
  styleUrl: './quiz.css'
})
export class Quiz implements OnInit {
  loading = false;
  lessonId = 0;
  current = 0;
  selected: string | null = null;
  answered = false;
  correct = 0;
  finished = false;
  xpEarned = 10;
  noHearts = false;

  dummyQuestions: Record<number, any[]> = {
    1: [
      { id: 1, question: 'Who created the C programming language?',
        option_a: 'Bjarne Stroustrup', option_b: 'Dennis Ritchie', option_c: 'James Gosling', option_d: 'Guido van Rossum', correct_option: 'b' },
      { id: 2, question: 'What is the correct file extension for C programs?',
        option_a: '.cpp', option_b: '.java', option_c: '.c', option_d: '.py', correct_option: 'c' },
      { id: 3, question: 'Which symbol ends a statement in C?',
        option_a: '.', option_b: ':', option_c: ',', option_d: ';', correct_option: 'd' },
    ],
    2: [
      { id: 4, question: 'Which data type stores whole numbers in C?',
        option_a: 'float', option_b: 'char', option_c: 'string', option_d: 'int', correct_option: 'd' },
      { id: 5, question: 'What is the size of int in C (typically)?',
        option_a: '1 byte', option_b: '2 bytes', option_c: '4 bytes', option_d: '8 bytes', correct_option: 'c' },
    ],
    3: [
      { id: 6, question: 'Which keyword is used to define a constant in C?',
        option_a: 'var', option_b: 'final', option_c: 'const', option_d: 'static', correct_option: 'c' },
      { id: 7, question: 'What does %d represent in printf?',
        option_a: 'double', option_b: 'decimal integer', option_c: 'string', option_d: 'character', correct_option: 'b' },
    ],
    4: [
      { id: 8, question: 'Which loop checks the condition AFTER executing the body?',
        option_a: 'for', option_b: 'while', option_c: 'do-while', option_d: 'foreach', correct_option: 'c' },
      { id: 9, question: 'What is the output of: printf("%d", 10 % 3)?',
        option_a: '3', option_b: '1', option_c: '0', option_d: '2', correct_option: 'b' },
    ],
  };

  questions: any[] = [];

  constructor(public auth: Auth, private route: ActivatedRoute) {}

  ngOnInit() {
    if (this.auth.getHearts() === 0) { this.noHearts = true; return; }
    this.lessonId = +this.route.snapshot.paramMap.get('id')! || 1;
    this.questions = this.dummyQuestions[this.lessonId] || this.dummyQuestions[1];
  }

  get question()     { return this.questions[this.current]; }
  get progress()     { return this.questions.length ? (this.current / this.questions.length) * 100 : 0; }
  get heartsArray()  { return Array(5).fill(0).map((_, i) => i < this.auth.getHearts()); }

  options = ['a', 'b', 'c', 'd'];
  optionKey: Record<string, string> = { a: 'option_a', b: 'option_b', c: 'option_c', d: 'option_d' };

  select(opt: string) {
    if (this.answered) return;
    this.selected = opt;
    this.answered = true;
    if (opt !== this.question?.correct_option) {
      this.auth.decrementHearts();
      if (this.auth.getHearts() === 0) setTimeout(() => { this.noHearts = true; }, 1200);
    }
  }

  isCorrect(opt: string) { return this.question?.correct_option === opt; }

  next() {
    if (this.selected === this.question?.correct_option) this.correct++;
    if (this.current < this.questions.length - 1) {
      this.current++;
      this.selected = null;
      this.answered = false;
    } else {
      this.finished = true;
      this.xpEarned = this.correct * 5;
    }
  }
}
