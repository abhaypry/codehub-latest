import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, Navbar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {
  user: any = null;

  courses = [
    { id: 1, title: 'C Programming',  color: '#04e88d', description: 'Learn the basics of C' },
    { id: 2, title: 'C++ Programming', color: '#7B68EE', description: 'OOP with C++' },
    { id: 3, title: 'Java',            color: '#ffc800', description: 'Build apps with Java' },
    { id: 4, title: 'C#',             color: '#ff6b6b', description: 'Modern C# development' },
  ];

  selectedCourse = this.courses[0];
  loading = false;

  private positions = ['center', 'right', 'center', 'left'];

  allLessons: Record<number, any[]> = {
    1: [
      { id: 1,  title: 'Intro to C',        xp_reward: 10, state: 'done' },
      { id: 2,  title: 'Variables & Types',  xp_reward: 10, state: 'done' },
      { id: 3,  title: 'Operators',          xp_reward: 10, state: 'done' },
      { id: 4,  title: 'Control Flow',       xp_reward: 15, state: 'active' },
      { id: 5,  title: 'Functions',          xp_reward: 15, state: 'locked' },
      { id: 6,  title: 'Arrays',             xp_reward: 20, state: 'locked' },
      { id: 7,  title: 'Pointers',           xp_reward: 20, state: 'locked' },
      { id: 8,  title: 'Strings',            xp_reward: 15, state: 'locked' },
    ],
    2: [
      { id: 9,  title: 'Intro to C++',       xp_reward: 10, state: 'done' },
      { id: 10, title: 'Classes & Objects',  xp_reward: 15, state: 'active' },
      { id: 11, title: 'Inheritance',        xp_reward: 15, state: 'locked' },
      { id: 12, title: 'Polymorphism',       xp_reward: 20, state: 'locked' },
    ],
    3: [
      { id: 13, title: 'Java Basics',        xp_reward: 10, state: 'active' },
      { id: 14, title: 'OOP in Java',        xp_reward: 15, state: 'locked' },
      { id: 15, title: 'Collections',        xp_reward: 15, state: 'locked' },
    ],
    4: [
      { id: 16, title: 'C# Intro',           xp_reward: 10, state: 'active' },
      { id: 17, title: '.NET Basics',        xp_reward: 15, state: 'locked' },
      { id: 18, title: 'LINQ',               xp_reward: 20, state: 'locked' },
    ],
  };

  pathNodes: any[] = [];

  ngOnInit() {
    this.user = { name: 'Abhay', xp: 340, streak: 7, hearts: 5 };
    this.buildPath(this.courses[0]);
  }

  selectCourse(course: any) {
    this.selectedCourse = course;
    this.buildPath(course);
  }

  buildPath(course: any) {
    const lessons = this.allLessons[course.id] || [];
    this.pathNodes = lessons.map((l, i) => ({ ...l, pos: this.positions[i % 4] }));
  }

  get level()     { return Math.floor((this.user?.xp || 0) / 100) + 1; }
  get xpInLevel() { return (this.user?.xp || 0) % 100; }
}
