import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-lessons',
  imports: [CommonModule, RouterLink, Navbar],
  templateUrl: './lessons.html',
  styleUrl: './lessons.css'
})
export class Lessons implements OnInit {
  loading = false;
  courseId = 1;

  allLessons: Record<number, any[]> = {
    1: [
      { id: 1, title: 'Introduction to C',      content: 'History of C, why it matters, first program.',           xp_reward: 10, done: true  },
      { id: 2, title: 'Variables & Data Types',  content: 'int, float, char, double and how to declare them.',      xp_reward: 10, done: true  },
      { id: 3, title: 'Operators',               content: 'Arithmetic, relational and logical operators.',           xp_reward: 10, done: true  },
      { id: 4, title: 'Control Flow',            content: 'if/else, switch, ternary operator.',                     xp_reward: 15, done: false },
      { id: 5, title: 'Loops',                   content: 'for, while and do-while loops with examples.',           xp_reward: 15, done: false },
      { id: 6, title: 'Functions',               content: 'Declaring, defining and calling functions.',              xp_reward: 15, done: false },
      { id: 7, title: 'Arrays',                  content: '1D and 2D arrays, traversal and operations.',            xp_reward: 20, done: false },
      { id: 8, title: 'Pointers',                content: 'Memory addresses, pointer arithmetic, and references.',  xp_reward: 20, done: false },
    ],
    2: [
      { id: 9,  title: 'Intro to C++',      content: 'Differences from C, namespaces, cin/cout.',          xp_reward: 10, done: true  },
      { id: 10, title: 'Classes & Objects', content: 'Defining classes, constructors, member functions.',   xp_reward: 15, done: false },
      { id: 11, title: 'Inheritance',       content: 'Base and derived classes, access specifiers.',        xp_reward: 15, done: false },
      { id: 12, title: 'Polymorphism',      content: 'Virtual functions, overriding, runtime dispatch.',   xp_reward: 20, done: false },
    ],
    3: [
      { id: 13, title: 'Java Basics',     content: 'JVM, JDK, first Java program and syntax.',             xp_reward: 10, done: false },
      { id: 14, title: 'OOP in Java',     content: 'Classes, interfaces, abstract classes.',               xp_reward: 15, done: false },
      { id: 15, title: 'Collections',     content: 'ArrayList, HashMap, Set and iteration.',               xp_reward: 15, done: false },
    ],
    4: [
      { id: 16, title: 'C# Intro',    content: 'C# history, .NET, Hello World and IDE setup.',             xp_reward: 10, done: false },
      { id: 17, title: '.NET Basics', content: 'Common types, namespaces and standard library.',           xp_reward: 15, done: false },
      { id: 18, title: 'LINQ',        content: 'Language Integrated Query for collections.',               xp_reward: 20, done: false },
    ],
  };

  lessons: any[] = [];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.courseId = +this.route.snapshot.paramMap.get('id')! || 1;
    this.lessons = this.allLessons[this.courseId] || this.allLessons[1];
  }
}
