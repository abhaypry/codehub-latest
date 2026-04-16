import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';
import { Api } from '../../services/api';
import { Sidebar } from '../../shared/sidebar/sidebar';

const AVATAR_BASE = 'http://localhost/codehub-api/';

const BOY_AVATARS  = ['avatars/boy/boy1.png',  'avatars/boy/boy2.png',  'avatars/boy/boy3.png'];
const GIRL_AVATARS = ['avatars/girl/girl1.png', 'avatars/girl/girl2.png',
                      'avatars/girl/girl3.png', 'avatars/girl/girl4.png'];
const BANNERS      = ['banners/banner1.png', 'banners/banner2.png', 'banners/banner3.png'];

@Component({
  selector: 'app-profile',
  imports: [CommonModule, Sidebar],
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

  constructor(private auth: Auth, private api: Api) {}

  ngOnInit() {
    const user = this.auth.getUser();
    if (user) {
      // Show session data immediately, then fetch fresh from DB
      this.profile = { ...user };
      this.loadProfile(user.id);
    }
  }

  private loadProfile(userId: number) {
    this.api.getProfile(userId).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.profile = res.user;
          // Keep session up to date with latest DB values
          const stored = this.auth.getUser();
          if (stored) {
            this.auth.setUser({
              ...stored,
              xp:     res.user.xp,
              streak: res.user.streak,
              avatar: res.user.avatar,
              banner: res.user.banner
            });
          }
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
    return new Date(this.profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  mediaUrl(path: string | null | undefined): string {
    return path ? AVATAR_BASE + path : '';
  }

  get currentAvatarUrl(): string { return this.mediaUrl(this.profile?.avatar); }
  get currentBannerUrl(): string { return this.mediaUrl(this.profile?.banner); }
  get pickerList(): string[]     { return this.pickerGender === 'boy' ? this.boyAvatars : this.girlAvatars; }

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

    // Optimistic update — close modal & show change instantly
    const prev           = this.profile.avatar;
    this.profile         = { ...this.profile, avatar: this.selectedAvatar };
    this.auth.setUser({ ...user, avatar: this.selectedAvatar });
    this.editOpen        = false;

    // Persist to DB in background
    this.api.updateAvatar(user.id, this.selectedAvatar).subscribe({
      next: (res: any) => {
        if (!res.success) {
          // Revert if DB rejected
          this.profile = { ...this.profile, avatar: prev };
          this.auth.setUser({ ...this.auth.getUser(), avatar: prev });
          this.saveError = 'Avatar save failed. Try again.';
        }
      },
      error: () => {
        this.profile = { ...this.profile, avatar: prev };
        this.auth.setUser({ ...this.auth.getUser(), avatar: prev });
        this.saveError = 'Connection error. Changes reverted.';
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

    // Optimistic update — close modal & show change instantly
    const prev           = this.profile.banner;
    this.profile         = { ...this.profile, banner: this.selectedBanner };
    this.auth.setUser({ ...user, banner: this.selectedBanner });
    this.bannerEditOpen  = false;

    // Persist to DB in background
    this.api.updateBanner(user.id, this.selectedBanner).subscribe({
      next: (res: any) => {
        if (!res.success) {
          this.profile = { ...this.profile, banner: prev };
          this.auth.setUser({ ...this.auth.getUser(), banner: prev });
          this.saveError = 'Banner save failed. Try again.';
        }
      },
      error: () => {
        this.profile = { ...this.profile, banner: prev };
        this.auth.setUser({ ...this.auth.getUser(), banner: prev });
        this.saveError = 'Connection error. Changes reverted.';
      }
    });
  }

  logout() { this.auth.logout(); }
}
