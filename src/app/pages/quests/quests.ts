import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../shared/sidebar/sidebar';
import { Auth } from '../../services/auth';
import { Api } from '../../services/api';

interface Quest {
  id: number;
  icon: string;
  title: string;
  desc: string;
  xp: number;
  progress: number;
  goal: number;
  claimed: boolean;
}

@Component({
  selector: 'app-quests',
  imports: [CommonModule, Sidebar],
  templateUrl: './quests.html',
  styleUrl: './quests.css'
})
export class Quests implements OnInit, OnDestroy {
  loading = true;
  dailyQuests: Quest[] = [];
  weeklyQuest: Quest | null = null;
  user: any;
  timerDisplay = '';
  private timerInterval: any;

  constructor(private auth: Auth, private api: Api, private cdr: ChangeDetectorRef) {}

  get totalEarned(): number {
    const all = [...this.dailyQuests, ...(this.weeklyQuest ? [this.weeklyQuest] : [])];
    return all.filter(q => q.claimed).reduce((sum, q) => sum + q.xp, 0);
  }

  private get todayKey(): string {
    const today = new Date().toISOString().split('T')[0];
    return `quests_${this.user?.id}_${today}`;
  }

  private startTimer() {
    const tick = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.floor((midnight.getTime() - now.getTime()) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      this.timerDisplay = `${h}:${m}:${s}`;
      this.cdr.detectChanges();
    };
    tick();
    this.timerInterval = setInterval(tick, 1000);
  }

  ngOnDestroy() { clearInterval(this.timerInterval); }

  ngOnInit() {
    this.user = this.auth.getUser();
    const cached = this.auth.getCache(this.todayKey);
    if (cached?.daily?.length) {
      this.dailyQuests = cached.daily;
      this.weeklyQuest = cached.weekly ?? null;
      this.loading = false;
    } else {
      this.dailyQuests = this.buildFallbackQuests();
    }
    this.startTimer();
    this.loadQuests();
  }

  private loadQuests() {
    this.api.getQuests(this.user?.id || 0).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success && res.daily?.length) {
          // Preserve any optimistically-claimed state that isn't confirmed by server yet
          const localClaimed = new Set(this.dailyQuests.filter(q => q.claimed).map(q => q.id));
          this.dailyQuests = res.daily.map((q: any) => ({
            ...q,
            claimed: q.claimed || localClaimed.has(q.id)
          }));
          if (res.weekly) {
            const wClaimed = this.weeklyQuest?.claimed ?? false;
            this.weeklyQuest = { ...res.weekly, claimed: res.weekly.claimed || wClaimed };
          } else {
            this.weeklyQuest = null;
          }
          this.auth.setCache(this.todayKey, { daily: this.dailyQuests, weekly: this.weeklyQuest });
        }
      },
      error: () => { this.loading = false; }
    });
  }

  private buildFallbackQuests(): Quest[] {
    const streak = this.user?.streak || 0;
    return [
      { id: 1, icon: '📖', title: 'Complete a Lesson', desc: 'Finish any 1 lesson today',         xp: 10, progress: 0,               goal: 1, claimed: false },
      { id: 2, icon: '🎯', title: 'Quiz Master',        desc: 'Score 100% on any quiz',            xp: 15, progress: 0,               goal: 1, claimed: false },
      { id: 3, icon: '🔥', title: 'On Fire!',           desc: 'Log in today to keep your streak',  xp: 5,  progress: Math.min(streak, 1), goal: 1, claimed: false },
      { id: 4, icon: '⚡', title: 'Speed Coder',        desc: 'Finish 3 lessons in one day',       xp: 20, progress: 0,               goal: 3, claimed: false },
    ];
  }

  private setQuestClaimed(id: number, claimed: boolean) {
    this.dailyQuests = this.dailyQuests.map(q => q.id === id ? { ...q, claimed } : q);
    this.auth.setCache(this.todayKey, { daily: this.dailyQuests, weekly: this.weeklyQuest });
  }

  claim(quest: Quest) {
    if (quest.claimed || quest.progress < quest.goal) return;
    this.setQuestClaimed(quest.id, true);

    this.api.claimQuest(this.user?.id || 0, quest.id, quest.xp).subscribe({
      next: (res: any) => {
        if (res.success) {
          const stored = this.auth.getUser();
          if (stored) this.auth.setUser({ ...stored, xp: res.total_xp });
          this.user = this.auth.getUser();
          this.auth.setCache(this.todayKey, { daily: this.dailyQuests, weekly: this.weeklyQuest });
        } else {
          this.setQuestClaimed(quest.id, false);
        }
      },
      error: () => { this.setQuestClaimed(quest.id, false); }
    });
  }

  status(q: Quest): 'claim' | 'done' | 'progress' {
    if (q.claimed)            return 'done';
    if (q.progress >= q.goal) return 'claim';
    return 'progress';
  }

  get weeklyPct() {
    if (!this.weeklyQuest) return 0;
    return Math.round((this.weeklyQuest.progress / this.weeklyQuest.goal) * 100);
  }
}
