import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Api {
  private base = 'http://localhost/codehub-api';

  constructor(private http: HttpClient) {}

  register(data: any): Observable<any> {
    return this.http.post(`${this.base}/register.php`, data);
  }

  login(data: any): Observable<any> {
    return this.http.post(`${this.base}/login.php`, data);
  }

  getCourses(): Observable<any> {
    return this.http.get(`${this.base}/get_courses.php`);
  }

  getLessons(courseId: number): Observable<any> {
    return this.http.get(`${this.base}/get_lessons.php?course_id=${courseId}`);
  }

  getQuiz(lessonId: number): Observable<any> {
    return this.http.get(`${this.base}/get_quiz.php?lesson_id=${lessonId}`);
  }

  saveProgress(data: any): Observable<any> {
    return this.http.post(`${this.base}/save_progress.php`, data);
  }

  getLeaderboard(): Observable<any> {
    return this.http.get(`${this.base}/get_leaderboard.php`);
  }

  getProfile(userId: number): Observable<any> {
    return this.http.get(`${this.base}/get_profile.php?user_id=${userId}`);
  }

  updateHearts(data: any): Observable<any> {
    return this.http.post(`${this.base}/update_hearts.php`, data);
  }

  getUserProgress(userId: number): Observable<any> {
    return this.http.get(`${this.base}/get_user_progress.php?user_id=${userId}`);
  }
}
