import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-courses',
  imports: [CommonModule, RouterLink, Navbar],
  templateUrl: './courses.html',
  styleUrl: './courses.css'
})
export class Courses {
  loading = false;

  courses = [
    { id: 1, title: 'C Programming',   description: 'Master the foundational language of computing. Learn memory, pointers & more.',  color: '#04e88d', lessons: 8,  students: 1240 },
    { id: 2, title: 'C++ Programming', description: 'Build on C with object-oriented programming, templates and the STL.',             color: '#7B68EE', lessons: 10, students: 980  },
    { id: 3, title: 'Java',            description: 'Write once, run anywhere. Learn OOP, collections and Android basics.',            color: '#ffc800', lessons: 12, students: 1560 },
    { id: 4, title: 'C#',             description: 'Microsoft\'s modern language for .NET apps, games with Unity and more.',          color: '#ff6b6b', lessons: 9,  students: 720  },
  ];
}
