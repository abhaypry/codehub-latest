import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Api } from '../../services/api';
import { Sidebar } from '../../shared/sidebar/sidebar';

const AVATAR_BASE = '/assets/';

const BOY_AVATARS  = ['avatars/boy/boy1.png',  'avatars/boy/boy2.png',  'avatars/boy/boy3.png'];
const GIRL_AVATARS = ['avatars/girl/girl1.png', 'avatars/girl/girl2.png',
                      'avatars/girl/girl3.png', 'avatars/girl/girl4.png'];
const BANNERS      = ['banners/banner1.png', 'banners/banner2.png', 'banners/banner3.png'];

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, Sidebar],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  profile: any = null;
  saveError    = '';

  // Avatar picker state
  editOpen       = false;
  previewOpen    = false;
  pickerGender: 'boy' | 'girl' = 'boy';
  selectedAvatar = '';

  // Banner picker state
  bannerEditOpen = false;
  selectedBanner = '';

  readonly boyAvatars  = BOY_AVATARS;
  readonly girlAvatars = GIRL_AVATARS;
  readonly banners     = BANNERS;

  // Social / follow state
  activeTab: 'following' | 'followers' = 'following';
  following: any[] = [];
  followers: any[] = [];
  followingLoaded = false;
  followersLoaded = false;
  socialLoading = false;

  // Social count popup
  socialListOpen = false;
  socialListTab: 'following' | 'followers' = 'following';

  openSocialList(tab: 'following' | 'followers') {
    this.socialListTab = tab;
    this.socialListOpen = true;
  }
  closeSocialList() { this.socialListOpen = false; }

  // Find friends modal
  findFriendOpen  = false;
  searchQuery     = '';
  searchResults: any[] = [];
  searchLoading   = false;
  followLoading   = new Set<number>();
  private searchTimer: any = null;

  // Achievements modal
  achievementsOpen = false;

  get allAchievements() {
    const xp     = this.profile?.xp     || 0;
    const streak = this.profile?.streak || 0;
    const rank   = this.profile?.rank   || 999;
    return [
      { icon: '🔥', label: 'Streak Starter',  desc: 'Reach a 3-day streak',          unlocked: streak >= 3  },
      { icon: '🔥', label: 'On Fire',          desc: 'Reach a 7-day streak',          unlocked: streak >= 7  },
      { icon: '🔥', label: 'Unstoppable',      desc: 'Reach a 30-day streak',         unlocked: streak >= 30 },
      { icon: '⚡', label: 'First Steps',      desc: 'Earn 100 XP',                   unlocked: xp >= 100   },
      { icon: '⚡', label: 'XP Hunter',        desc: 'Earn 500 XP',                   unlocked: xp >= 500   },
      { icon: '⚡', label: 'XP Legend',        desc: 'Earn 1000 XP',                  unlocked: xp >= 1000  },
      { icon: '🏆', label: 'Top 10',           desc: 'Reach top 10 on leaderboard',   unlocked: rank <= 10  },
      { icon: '🏆', label: 'Top 3',            desc: 'Reach top 3 on leaderboard',    unlocked: rank <= 3   },
      { icon: '👑', label: 'Champion',         desc: 'Reach #1 on leaderboard',       unlocked: rank === 1  },
      { icon: '💎', label: 'Sapphire',         desc: 'Reach Sapphire league',         unlocked: streak >= 7  },
      { icon: '💎', label: 'Diamond',          desc: 'Earn 1000 XP and 30-day streak',unlocked: xp >= 1000 && streak >= 30 },
      { icon: '🎯', label: 'Perfect Score',    desc: 'Complete a quiz with 100%',     unlocked: false       },
    ];
  }

  get previewAchievements() {
    const unlocked = this.allAchievements.filter(a => a.unlocked);
    const locked   = this.allAchievements.filter(a => !a.unlocked);
    return [...unlocked, ...locked].slice(0, 5);
  }

  openAchievements()  { this.achievementsOpen = true;  }
  closeAchievements() { this.achievementsOpen = false; }

  // Edit profile modal
  profileEditOpen      = false;
  editName             = '';
  editEmail            = '';
  editUsername         = '';
  profileEditError     = '';
  profileEditSaving    = false;
  usernameStatus: 'idle' | 'checking' | 'available' | 'taken' | 'invalid' = 'idle';
  private unameTimer: any = null;

  openProfileEdit() {
    this.editName         = this.profile?.name     || '';
    this.editEmail        = this.profile?.email    || '';
    this.editUsername     = this.profile?.username || '';
    this.profileEditError = '';
    this.usernameStatus   = 'idle';
    this.profileEditOpen  = true;
  }
  closeProfileEdit() {
    clearTimeout(this.unameTimer);
    this.profileEditOpen = false;
  }

  onUsernameInput() {
    clearTimeout(this.unameTimer);
    const val = this.editUsername.trim();
    if (!val) { this.usernameStatus = 'idle'; return; }
    const re = /^[a-z0-9_]{3,30}$/;
    if (!re.test(val)) { this.usernameStatus = 'invalid'; this.cdr.detectChanges(); return; }
    if (val === (this.profile?.username || '')) { this.usernameStatus = 'available'; this.cdr.detectChanges(); return; }
    this.usernameStatus = 'checking';
    this.cdr.detectChanges();
    this.unameTimer = setTimeout(() => {
      const user = this.auth.getUser();
      if (!user) return;
      this.api.checkUsername(user.id, val).subscribe({
        next: (res: any) => {
          if (this.editUsername.trim() !== val) return;
          this.usernameStatus = res.available ? 'available' : 'taken';
          this.cdr.detectChanges();
        },
        error: () => {
          if (this.editUsername.trim() !== val) return;
          this.usernameStatus = 'idle';
          this.cdr.detectChanges();
        }
      });
    }, 250);
  }

  private setEditError(msg: string) {
    this.profileEditError = msg;
    this.cdr.detectChanges();
  }

  validateEmailField() {
    const email = this.editEmail.trim();
    if (!email) { this.setEditError('Email cannot be empty.'); return; }
    const emailRe = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRe.test(email)) { this.setEditError('Enter a valid email address.'); return; }
    this.profileEditError = '';
    this.cdr.detectChanges();
  }

  saveProfile() {
    if (!this.editName.trim())  { this.setEditError('Name cannot be empty.');  return; }
    if (!this.editEmail.trim()) { this.setEditError('Email cannot be empty.'); return; }
    const emailRe    = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRe.test(this.editEmail.trim())) { this.setEditError('Enter a valid email address.'); return; }
    const uname = this.editUsername.trim();
    if (this.usernameStatus === 'invalid') {
      this.setEditError('Username: 3–30 chars, lowercase letters, numbers, underscores only.');
      return;
    }
    if (this.usernameStatus === 'taken') {
      this.setEditError('Username already taken. Choose another.');
      return;
    }
    if (this.usernameStatus === 'checking') {
      this.setEditError('Wait for username check to finish.');
      return;
    }
    const user = this.auth.getUser();
    if (!user) return;

    this.profileEditSaving = true;
    this.profileEditError  = '';

    this.api.updateProfile(user.id, this.editName.trim(), this.editEmail.trim(), uname).subscribe({
      next: (res: any) => {
        this.profileEditSaving = false;
        if (res.success) {
          const updated = { ...this.profile, name: this.editName.trim(), email: this.editEmail.trim(), username: uname || null };
          this.profile = updated;
          this.auth.setUser({ ...this.auth.getUser()!, name: this.editName.trim(), email: this.editEmail.trim(), username: uname || null });
          this.profileEditOpen = false;
          this.cdr.detectChanges();
        } else {
          this.profileEditError = res.message || 'Failed to save. Try again.';
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.profileEditSaving = false;
        this.profileEditError  = 'Connection error. Try again.';
        this.cdr.detectChanges();
      }
    });
  }

  // Invite friends modal
  inviteOpen = false;

  // User popup state
  selectedSocialUser: any = null;

  openUserPopup(u: any) { this.selectedSocialUser = u; }
  closeUserPopup()       { this.selectedSocialUser = null; }

  isFollowingUser(id: number): boolean { return this.following.some(u => u.id === id); }

  followFromPopup(user: any, action: 'follow' | 'unfollow') {
    const me = this.auth.getUser();
    if (!me) return;
    this.api.followUser(me.id, user.id, action).subscribe({
      next: () => { this.loadFollowing(); this.loadFollowers(); },
      error: () => {}
    });
  }

  constructor(private auth: Auth, private api: Api, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const user = this.auth.getUser();
    if (user) {
      this.profile = { rank: null, ...user };
      this.loadProfile(user.id);
      this.loadFollowing();
      this.loadFollowers();
    }
  }

  private loadProfile(userId: number) {
    this.api.getProfile(userId).subscribe({
      next: (res: any) => {
        if (res.success) {
          const u = res.user;
          // Null-safe merge: don't overwrite cached values with null from API
          Object.keys(u).forEach(k => {
            if (u[k] !== null && u[k] !== undefined) this.profile[k] = u[k];
          });
          const stored = this.auth.getUser();
          if (stored) {
            this.auth.setUser({
              ...stored,
              xp:       u.xp       ?? stored.xp,
              streak:   u.streak   ?? stored.streak,
              avatar:   u.avatar   ?? stored.avatar,
              banner:   u.banner   ?? stored.banner,
              rank:     u.rank     ?? stored.rank,
              username: u.username ?? stored.username,
              name:     u.name     ?? stored.name,
            });
          }
          this.cdr.detectChanges();
        }
      },
      error: () => {}
    });
  }

  // ── Computed ──────────────────────────────────────────────────
  get level()     { return this.profile ? Math.floor((this.profile.xp || 0) / 100) + 1 : 1; }
  get xpInLevel() { return this.profile ? (this.profile.xp || 0) % 100 : 0; }
  get joinDate()  {
    if (!this.profile?.created_at) return 'Recently';
    const iso = String(this.profile.created_at).replace(' ', 'T');
    const d = new Date(iso);
    return isNaN(d.getTime()) ? 'Recently' : d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  mediaUrl(path: string | null | undefined): string {
    return path ? AVATAR_BASE + path : '';
  }

  get currentAvatarUrl(): string { return this.mediaUrl(this.profile?.avatar); }
  get currentBannerUrl(): string { return this.mediaUrl(this.profile?.banner); }
  get pickerList(): string[]     { return this.pickerGender === 'boy' ? this.boyAvatars : this.girlAvatars; }

  avatarImgLoaded = false;
  onAvatarImgLoad() { this.avatarImgLoaded = true; }

  // ── Preview popup ─────────────────────────────────────────────
  openPreview()  { if (this.currentAvatarUrl) this.previewOpen = true; }
  closePreview() { this.previewOpen = false; }

  // ── Avatar modal ──────────────────────────────────────────────
  openEdit() {
    this.selectedAvatar = this.profile?.avatar || '';
    this.pickerGender   = this.selectedAvatar.includes('girl') ? 'girl' : 'boy';
    this.saveError      = '';
    this.editOpen       = true;
  }
  closeEdit() { this.editOpen = false; }
  selectAvatar(path: string) { this.selectedAvatar = path; }

  saveAvatar() {
    if (!this.selectedAvatar) return;
    const user = this.auth.getUser();
    if (!user) return;

    const prev    = this.profile.avatar;
    this.profile  = { ...this.profile, avatar: this.selectedAvatar };
    this.auth.setUser({ ...user, avatar: this.selectedAvatar });
    this.editOpen = false;

    this.api.updateAvatar(user.id, this.selectedAvatar).subscribe({
      next: (res: any) => {
        if (!res.success) {
          this.profile = { ...this.profile, avatar: prev };
          this.auth.setUser({ ...this.auth.getUser(), avatar: prev });
          this.saveError = 'Avatar save failed. Try again.';
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.profile = { ...this.profile, avatar: prev };
        this.auth.setUser({ ...this.auth.getUser(), avatar: prev });
        this.saveError = 'Connection error. Changes reverted.';
        this.cdr.detectChanges();
      }
    });
  }

  // ── Banner modal ──────────────────────────────────────────────
  openBannerEdit() {
    this.selectedBanner = this.profile?.banner || '';
    this.saveError      = '';
    this.bannerEditOpen = true;
  }
  closeBannerEdit() { this.bannerEditOpen = false; }
  selectBanner(path: string) { this.selectedBanner = path; }

  saveBanner() {
    if (!this.selectedBanner) return;
    const user = this.auth.getUser();
    if (!user) return;

    const prev          = this.profile.banner;
    this.profile        = { ...this.profile, banner: this.selectedBanner };
    this.auth.setUser({ ...user, banner: this.selectedBanner });
    this.bannerEditOpen = false;

    this.api.updateBanner(user.id, this.selectedBanner).subscribe({
      next: (res: any) => {
        if (!res.success) {
          this.profile = { ...this.profile, banner: prev };
          this.auth.setUser({ ...this.auth.getUser(), banner: prev });
          this.saveError = 'Banner save failed. Try again.';
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.profile = { ...this.profile, banner: prev };
        this.auth.setUser({ ...this.auth.getUser(), banner: prev });
        this.saveError = 'Connection error. Changes reverted.';
        this.cdr.detectChanges();
      }
    });
  }

  // ── Social tabs ───────────────────────────────────────────────
  switchTab(tab: 'following' | 'followers') {
    this.activeTab = tab;
  }

  loadFollowing() {
    const user = this.auth.getUser();
    if (!user) return;
    this.api.getFollowing(user.id).subscribe({
      next: (res: any) => {
        this.following = res.success ? res.users : [];
        this.followingLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => { this.followingLoaded = true; this.cdr.detectChanges(); }
    });
  }

  loadFollowers() {
    const user = this.auth.getUser();
    if (!user) return;
    this.api.getFollowers(user.id).subscribe({
      next: (res: any) => {
        this.followers = res.success ? res.users : [];
        this.followersLoaded = true;
        this.cdr.detectChanges();
      },
      error: () => { this.followersLoaded = true; this.cdr.detectChanges(); }
    });
  }

  // ── Find friends modal ────────────────────────────────────────
  openFindFriend() {
    this.findFriendOpen = true;
    this.searchQuery    = '';
    this.searchResults  = [];
    this.searchLoading  = false;
    this.runSearch();
  }
  closeFindFriend() {
    clearTimeout(this.searchTimer);
    this.findFriendOpen = false;
  }

  runSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      const user = this.auth.getUser();
      if (!user) return;
      this.searchLoading = true;
      this.cdr.detectChanges();
      this.api.searchUsers(user.id, this.searchQuery).subscribe({
        next: (res: any) => {
          this.searchResults = res.success ? res.users : [];
          this.searchLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.searchResults = [];
          this.searchLoading = false;
          this.cdr.detectChanges();
        }
      });
    }, 300);
  }

  searchNow() {
    clearTimeout(this.searchTimer);
    const user = this.auth.getUser();
    if (!user) return;
    this.searchLoading = true;
    this.api.searchUsers(user.id, this.searchQuery).subscribe({
      next: (res: any) => {
        this.searchResults = res.success ? res.users : [];
        this.searchLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.searchResults = [];
        this.searchLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleFollow(targetUser: any) {
    if (this.followLoading.has(targetUser.id)) return;
    const user = this.auth.getUser();
    if (!user) return;

    const action = targetUser.is_following ? 'unfollow' : 'follow';
    this.followLoading.add(targetUser.id);
    targetUser.is_following = !targetUser.is_following;
    this.cdr.detectChanges();

    this.api.followUser(user.id, targetUser.id, action).subscribe({
      next: () => {
        this.followLoading.delete(targetUser.id);
        this.loadFollowing();
        this.loadFollowers();
        this.cdr.detectChanges();
      },
      error: () => {
        targetUser.is_following = !targetUser.is_following;
        this.followLoading.delete(targetUser.id);
        this.cdr.detectChanges();
      }
    });
  }

  isFollowLoading(id: number) { return this.followLoading.has(id); }

  // ── Invite friends modal ──────────────────────────────────────
  openInvite()  { this.inviteOpen = true; }
  closeInvite() { this.inviteOpen = false; }

  readonly inviteWhatsAppMsg =
`Hey! Join me on CodeHub — a free platform to learn coding through bite-sized lessons, quizzes, streaks, and a leaderboard. It's like Duolingo but for programming!

Courses: Python, JavaScript, Web Development, and more.

Sign up free: www.codehub.com

See you on the leaderboard!`;

  readonly inviteEmailMsg =
`Hi,

I'd like to invite you to join CodeHub — a free platform to learn programming through short lessons, quizzes, and daily streaks. Think of it as Duolingo for coding.

What you get:
- Courses in Python, JavaScript, Web Development, and more
- XP rewards, streak tracking, and a global leaderboard
- Bite-sized lessons you can finish in 5–10 minutes

Sign up for free at: www.codehub.com

Hope to see you on the leaderboard!

Best regards,
${this.profile?.name || 'A CodeHub learner'}`;

  shareWhatsApp() {
    window.open('https://wa.me/?text=' + encodeURIComponent(this.inviteWhatsAppMsg), '_blank');
  }

  shareEmail() {
    const su   = encodeURIComponent('Join me on CodeHub - Learn to code properly');
    const body = encodeURIComponent(this.inviteEmailMsg);
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${su}&body=${body}`, '_blank');
  }

  logout() { this.auth.logout(); }
}
