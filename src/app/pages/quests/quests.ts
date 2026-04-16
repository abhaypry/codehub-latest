import { Component, OnInit, OnDestroy } from '@angular/core';
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
  totalEarned = 0;
  user: any;
  timerDisplay = '';
  private timerInterval: any;

  constructor(private auth: Auth, private api: Api) {}

  private startTimer() {
    const tick = () => {
      const now  = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.floor((midnight.getTime() - now.getTime()) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      this.timerDisplay = `${h}:${m}:${s}`;
    };
    tick();
    this.timerInterval = setInterval(tick, 1000);
  }

  ngOnDestroy() { clearInterval(this.timerInterval); }

  ngOnInit() {
    this.user = this.auth.getUser();
    this.dailyQuests = this.buildFallbackQuests();
    this.startTimer();
    this.loadQuests();
  }

  private loadQuests() {
    this.api.getQuests(this.user?.id || 0).subscribe({
      next: (res: any) => {
        this.loading = false;
        if (res.success && res.daily?.length) {
          this.dailyQuests = res.daily;
          this.weeklyQuest = res.weekly || null;
          // Recalculate totalEarned from already-claimed quests
          const all = [...res.daily, ...(res.weekly ? [res.weekly] : [])];
          this.totalEarned = all
            .filter((q: any) => q.claimed)
            .reduce((sum: number, q: any) => sum + q.xp, 0);
        }
      },
      error: () => { this.loading = false; }
    });
  }

  private buildFallbackQuests(): Quest[] {
    const streak = this.user?.streak || 0;
    return [
      { id: 1, icon: '📖', title: 'Complete a Lesson', desc: 'Finish any 1 lesson today',    xp: 10, progress: 0,               goal: 1, claimed: false },
      { id: 2, icon: '🎯', title: 'Quiz Master',        desc: 'Score 100% on any quiz',       xp: 15, progress: 0,               goal: 1, claimed: false },
      { id: 3, icon: '🔥', title: 'On Fire!',           desc: 'Maintain your daily streak',   xp: 5,  progress: Math.min(streak, 1), goal: 1, claimed: false },
      { id: 4, icon: '⚡', title: 'Speed Coder',        desc: 'Finish 3 lessons in one day',  xp: 20, progress: 0,               goal: 3, claimed: false },
    ];
  }

  claim(quest: Quest) {
    if (quest.claimed || quest.progress < quest.goal) return;

    // Optimistic update — instant UI feedback on click
    quest.claimed = true;
    this.totalEarned += quest.xp;

    this.api.claimQuest(this.user?.id || 0, quest.id, quest.xp).subscribe({
      next: (res: any) => {
        if (res.success) {
          const stored = this.auth.getUser();
          if (stored) this.auth.setUser({ ...stored, xp: res.total_xp });
          this.user = this.auth.getUser();
          // Reload quests from backend so claimed state is authoritative
          this.loadQuests();
        } else {
          quest.claimed = false;
          this.totalEarned -= quest.xp;
        }
      },
      error: () => {
        quest.claimed = false;
        this.totalEarned -= quest.xp;
      }
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
