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

  getUserCourses(userId: number): Observable<any> {
    return this.http.get(`${this.base}/get_user_courses.php?user_id=${userId}`);
  }

  enrollCourses(userId: number, courseIds: number[]): Observable<any> {
    return this.http.post(`${this.base}/enroll_courses.php`, { user_id: userId, course_ids: courseIds });
  }

  getLessons(courseId: number, userId?: number): Observable<any> {
    const url = userId
      ? `${this.base}/get_lessons.php?course_id=${courseId}&user_id=${userId}`
      : `${this.base}/get_lessons.php?course_id=${courseId}`;
    return this.http.get(url);
  }

  getQuiz(lessonId: number): Observable<any> {
    return this.http.get(`${this.base}/get_quiz.php?lesson_id=${lessonId}`);
  }

  validateQuiz(userId: number, lessonId: number, answers: Record<number, string>): Observable<any> {
    return this.http.post(`${this.base}/validate_quiz.php`, { user_id: userId, lesson_id: lessonId, answers });
  }

  deductHearts(userId: number): Observable<any> {
    return this.http.post(`${this.base}/deduct_hearts.php`, { user_id: userId });
  }

  updateHearts(userId: number, action: 'lose' | 'refill'): Observable<any> {
    return this.http.post(`${this.base}/update_hearts.php`, { user_id: userId, action });
  }

  getLeaderboard(): Observable<any> {
    return this.http.get(`${this.base}/get_leaderboard.php`);
  }

  getProfile(userId: number): Observable<any> {
    return this.http.get(`${this.base}/get_profile.php?user_id=${userId}`);
  }

  saveProgress(userId: number, lessonId: number): Observable<any> {
    return this.http.post(`${this.base}/save_progress.php`, { user_id: userId, lesson_id: lessonId, score: 100 });
  }

  updateAvatar(userId: number, avatar: string): Observable<any> {
    return this.http.post(`${this.base}/update_avatar.php`, { user_id: userId, avatar });
  }

  updateBanner(userId: number, banner: string): Observable<any> {
    return this.http.post(`${this.base}/update_banner.php`, { user_id: userId, banner });
  }

  getQuests(userId: number): Observable<any> {
    return this.http.get(`${this.base}/get_quests.php?user_id=${userId}`);
  }

  claimQuest(userId: number, questId: number, xp: number): Observable<any> {
    return this.http.post(`${this.base}/claim_quest.php`, { user_id: userId, quest_id: questId, xp });
  }
}
