import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * API Service
 * Makes HTTP requests to PHP backend at localhost/codehub-api
 * All methods return Observables that components subscribe to
 * Used by all pages to fetch courses, lessons, quiz questions, leaderboard, etc.
 */
@Injectable({ providedIn: 'root' })
export class Api {
  // Base URL where PHP API files live (must match XAMPP setup)
  private base = 'https://codehub-api-production.up.railway.app';

  constructor(private http: HttpClient) {}

  // ====== USER REGISTRATION & LOGIN ======

  /**
   * Create new user account
   * Sends email + password to backend, gets back user object (id, name, email, xp, hearts)
   * Used by: register.component
   */
  register(data: any): Observable<any> {
    return this.http.post(`${this.base}/register.php`, data);
  }

  /**
   * Log in existing user
   * Sends email + password, backend returns user data if credentials match
   * Used by: login.component
   */
  login(data: any): Observable<any> {
    return this.http.post(`${this.base}/login.php`, data);
  }

  // ====== COURSES (Programming Languages) ======

  /**
   * Get all available courses
   * Returns list of all courses: JavaScript, Python, HTML, CSS, etc.
   * Used by: courses.component (displays grid of all courses)
   */
  getCourses(): Observable<any> {
    return this.http.get(`${this.base}/get_courses.php`);
  }

  /**
   * Get only courses this user has enrolled in
   * Returns subset of courses user is actively learning
   * Used by: dashboard.component (winding lesson path)
   */
  getUserCourses(userId: number): Observable<any> {
    return this.http.get(`${this.base}/get_user_courses.php?user_id=${userId}`);
  }

  /**
   * Add user to multiple courses at once
   * Lets user "enroll" in Python, JavaScript, etc. from courses page
   * Used by: courses.component (when user clicks enroll buttons)
   */
  enrollCourses(userId: number, courseIds: number[]): Observable<any> {
    return this.http.post(`${this.base}/enroll_courses.php`, { user_id: userId, course_ids: courseIds });
  }

  // ====== LESSONS (Learning Modules) ======

  /**
   * Get all lessons in a course
   * Can pass userId to also get user's completion status on each lesson
   * Returns: List of lessons (e.g., "Variables", "Loops", "Functions" for Python)
   * Used by: lessons.component (displays lesson list in a course)
   */
  getLessons(courseId: number, userId?: number): Observable<any> {
    const url = userId
      ? `${this.base}/get_lessons.php?course_id=${courseId}&user_id=${userId}`
      : `${this.base}/get_lessons.php?course_id=${courseId}`;
    return this.http.get(url);
  }

  // ====== QUIZ (Multiple-Choice Questions) ======

  /**
   * Get all quiz questions for a lesson
   * Returns 4-8 multiple-choice questions with answer options
   * Used by: quiz.component (before quiz starts)
   */
  getQuiz(lessonId: number): Observable<any> {
    return this.http.get(`${this.base}/get_quiz.php?lesson_id=${lessonId}`);
  }

  /**
   * Submit quiz answers and check if correct
   * Backend compares user answers against correct answers
   * Returns: Score, pass/fail status, XP earned
   * Used by: quiz.component (after user clicks "Submit Quiz")
   */
  validateQuiz(userId: number, lessonId: number, answers: Record<number, string>): Observable<any> {
    return this.http.post(`${this.base}/validate_quiz.php`, { user_id: userId, lesson_id: lessonId, answers });
  }

  // ====== HEARTS SYSTEM (Lives) ======

  /**
   * Remove 1 heart when user answers quiz question wrong
   * When hearts = 0, quiz is locked and user must refill hearts
   * Used by: quiz.component (when user selects wrong answer)
   */
  deductHearts(userId: number): Observable<any> {
    return this.http.post(`${this.base}/deduct_hearts.php`, { user_id: userId });
  }

  /**
   * Lose or refill hearts
   * action = 'lose' (wrong answer) or 'refill' (user taps refill button to get 5 hearts back)
   * Used by: quiz.component, navbar.component
   */
  updateHearts(userId: number, action: 'lose' | 'refill'): Observable<any> {
    return this.http.post(`${this.base}/update_hearts.php`, { user_id: userId, action });
  }

  // ====== LEADERBOARD (Rankings) ======

  /**
   * Get top 10 users ranked by total XP
   * Returns: List of best learners with their name, XP, level, avatar
   * Used by: leaderboard.component (shows podium + rankings)
   */
  getLeaderboard(): Observable<any> {
    return this.http.get(`${this.base}/get_leaderboard.php`);
  }

  // ====== PROFILE (User Stats) ======

  /**
   * Get user profile data
   * Returns: Name, email, XP, level, streak, rank, hearts, avatar image, banner image
   * Used by: profile.component (shows user's stats + achievements)
   */
  getProfile(userId: number): Observable<any> {
    return this.http.get(`${this.base}/get_profile.php?user_id=${userId}`);
  }

  // ====== PROGRESS TRACKING ======

  /**
   * Mark lesson as completed and award XP
   * Called after user passes quiz. Updates user_progress table in database
   * Used by: quiz.component (after validateQuiz succeeds)
   */
  saveProgress(userId: number, lessonId: number): Observable<any> {
    return this.http.post(`${this.base}/save_progress.php`, { user_id: userId, lesson_id: lessonId, score: 100 });
  }

  // ====== PROFILE CUSTOMIZATION (User Settings) ======

  /**
   * Change user's profile picture
   * Sends image file or URL to backend
   * Used by: profile.component (edit profile form)
   */
  updateAvatar(userId: number, avatar: string): Observable<any> {
    return this.http.post(`${this.base}/update_avatar.php`, { user_id: userId, avatar });
  }

  /**
   * Change user's profile banner/header image
   * Sends image file or URL to backend
   * Used by: profile.component (edit profile form)
   */
  updateBanner(userId: number, banner: string): Observable<any> {
    return this.http.post(`${this.base}/update_banner.php`, { user_id: userId, banner });
  }

  /**
   * Update user's name, email, or username
   * Used by: profile.component (edit profile form)
   */
  updateProfile(userId: number, name: string, email: string, username: string): Observable<any> {
    return this.http.post(`${this.base}/update_profile.php`, { user_id: userId, name, email, username });
  }

  /**
   * Check if username is already used by another user
   * Returns: true if available, false if taken
   * Used by: profile.component (real-time validation while user types)
   */
  checkUsername(userId: number, username: string): Observable<any> {
    return this.http.get(`${this.base}/check_username.php?user_id=${userId}&username=${encodeURIComponent(username)}`);
  }

  // ====== QUESTS (Side Tasks for Bonus XP) ======

  /**
   * Get all available quests for this user
   * Quests = extra challenges (not required) to earn bonus XP
   * Used by: quest.component or navbar (if quest feature added)
   */
  getQuests(userId: number): Observable<any> {
    return this.http.get(`${this.base}/get_quests.php?user_id=${userId}`);
  }

  /**
   * Complete a quest and claim the XP reward
   * Called when user finishes quest requirement (e.g., complete 5 lessons, get 100 XP)
   * Used by: quest.component
   */
  claimQuest(userId: number, questId: number, xp: number): Observable<any> {
    return this.http.post(`${this.base}/claim_quest.php`, { user_id: userId, quest_id: questId, xp });
  }

  // ====== SOCIAL (Following & Friends) ======

  /**
   * Get list of users that current user follows
   * Used by: social.component (if social feature added)
   */
  getFollowing(userId: number): Observable<any> {
    return this.http.get(`${this.base}/get_following.php?user_id=${userId}`);
  }

  /**
   * Get list of users that follow current user
   * Used by: profile.component or social.component
   */
  getFollowers(userId: number): Observable<any> {
    return this.http.get(`${this.base}/get_followers.php?user_id=${userId}`);
  }

  /**
   * Search for other users by name or username
   * Returns: List of matching user profiles
   * Used by: social.component or user search page
   */
  searchUsers(userId: number, q: string): Observable<any> {
    return this.http.get(`${this.base}/search_users.php?user_id=${userId}&q=${encodeURIComponent(q)}`);
  }

  /**
   * Follow or unfollow a user
   * action = 'follow' (add to following list) or 'unfollow' (remove from following list)
   * Used by: profile.component or social.component
   */
  followUser(followerId: number, followingId: number, action: 'follow' | 'unfollow'): Observable<any> {
    return this.http.post(`${this.base}/follow_user.php`, { follower_id: followerId, following_id: followingId, action });
  }

  // ====== SPECIAL/TRIAL MODE ======

  /**
   * Start trial/demo mode for new user
   * User gets limited hearts (3) + access to 1-2 sample lessons
   * Helps user try app before committing to full account
   */
  startTrial(userId: number): Observable<any> {
    return this.http.post(`${this.base}/start_trial.php`, { user_id: userId });
  }
}
