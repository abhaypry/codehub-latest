import { Component, AfterViewInit, OnDestroy, ElementRef, ChangeDetectorRef, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { NexaRive } from '../../shared/nexa-rive/nexa-rive';
import { ThemeService, THEMES } from '../../services/theme';

interface PopupInfo { icon: string; title: string; body: string; }

@Component({
  selector: 'app-home',
  imports: [RouterLink, Navbar, NexaRive],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements AfterViewInit, OnDestroy {
  popup: PopupInfo | null = null;
  private el  = inject(ElementRef);
  private cdr = inject(ChangeDetectorRef);
  theme = inject(ThemeService);
  readonly themes = THEMES;

  // Typewriter — cycles through subjects in the hero heading
  readonly twWords = ['coding.', 'C.', 'C++.', 'Java.', 'algorithms.'];
  twDisplay = 'coding.';
  private twIdx = 0;
  private twCh = 7;  // 'coding.' = 7 chars, start fully typed
  private twPhase: 'pausing' | 'deleting' | 'typing' = 'pausing';
  private twTimer: ReturnType<typeof setTimeout> | null = null;

  ngAfterViewInit(): void {
    // Scroll-reveal observer
    const revealObs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          revealObs.unobserve(e.target);
        }
      }),
      { threshold: 0.18, rootMargin: '0px 0px -40px 0px' }
    );
    this.el.nativeElement
      .querySelectorAll('.animate-in-left, .animate-in-right')
      .forEach((el: Element) => revealObs.observe(el));

    // Stats counter — fades in band + animates numbers on scroll
    const statsEl = this.el.nativeElement.querySelector('.stats-band-inner');
    if (statsEl) {
      new IntersectionObserver(([entry], obs) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          this.animateCounters(entry.target as HTMLElement);
          obs.unobserve(entry.target);
        }
      }, { threshold: 0.3 }).observe(statsEl);
    }

    // Typewriter starts after 1.4s so hero text is read first
    this.twTimer = setTimeout(() => this.twTick(), 1400);
  }

  ngOnDestroy(): void {
    if (this.twTimer) clearTimeout(this.twTimer);
  }

  private twTick(): void {
    const word = this.twWords[this.twIdx];
    if (this.twPhase === 'pausing') {
      this.twPhase = 'deleting';
      this.twTick();
    } else if (this.twPhase === 'deleting') {
      if (this.twCh > 0) {
        this.twDisplay = word.slice(0, --this.twCh);
        this.cdr.detectChanges();
        this.twTimer = setTimeout(() => this.twTick(), 46);
      } else {
        this.twIdx = (this.twIdx + 1) % this.twWords.length;
        this.twPhase = 'typing';
        this.twTimer = setTimeout(() => this.twTick(), 260);
      }
    } else {
      const next = this.twWords[this.twIdx];
      if (this.twCh < next.length) {
        this.twDisplay = next.slice(0, ++this.twCh);
        this.cdr.detectChanges();
        this.twTimer = setTimeout(() => this.twTick(), 75 + Math.random() * 40);
      } else {
        this.twPhase = 'pausing';
        this.twTimer = setTimeout(() => this.twTick(), 2100);
      }
    }
  }

  private animateCounters(container: HTMLElement): void {
    container.querySelectorAll<HTMLElement>('[data-count]').forEach(el => {
      const raw = el.dataset['count'] ?? '0';
      const target = parseFloat(raw);
      const isFloat = raw.includes('.');
      const t0 = performance.now();
      const run = (now: number) => {
        const p = Math.min((now - t0) / 2400, 1);
        const v = target * (1 - Math.pow(1 - p, 3));
        el.textContent = isFloat ? v.toFixed(1) : Math.floor(v).toLocaleString();
        if (p < 1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
    });
  }

  private readonly info: Record<string, PopupInfo> = {
    github:         { icon: '💻', title: 'GitHub',           body: "CodeHub's source code lives here. Star us, fork us, or contribute — it's all open!" },
    twitter:        { icon: '𝕏',  title: 'Twitter / X',      body: 'Follow CodeHub for coding tips, platform updates, and the occasional meme.' },
    instagram:      { icon: '📸', title: 'Instagram',        body: 'Student spotlights, daily coding inspo, and behind-the-scenes content.' },
    linkedin:       { icon: '💼', title: 'LinkedIn',         body: 'Connect with CodeHub professionally and follow our company page for updates.' },
    youtube:        { icon: '▶️', title: 'YouTube',          body: 'Video walkthroughs, coding challenges, and course previews — coming soon!' },
    appstore:       { icon: '🍎', title: 'App Store',        body: 'CodeHub for iOS is in development. Mobile learning on the go — stay tuned!' },
    playstore:      { icon: '🤖', title: 'Google Play',      body: 'CodeHub for Android is coming. Full lesson paths, quizzes, and streaks in your pocket.' },
    about:          { icon: '🏠', title: 'About CodeHub',    body: 'CodeHub is a free, Duolingo-style coding platform. Learn programming through bite-sized lessons, quizzes, XP, and streaks — built as a college project by Abhay Prajapati.' },
    blog:           { icon: '✍️', title: 'Blog',             body: 'Articles, tutorials, and developer stories from the CodeHub community. Content dropping soon!' },
    careers:        { icon: '🚀', title: 'Careers',          body: "We're a college project with big dreams. If you're passionate about ed-tech, hit us up!" },
    presskit:       { icon: '🗂️', title: 'Press Kit',        body: 'Logos, screenshots, and brand assets for media and press use. Email us to request.' },
    contact:        { icon: '✉️', title: 'Contact Us',       body: 'Reach the CodeHub team at abhayprajapatibussiness@gmail.com — we reply to everyone!' },
    helpCenter:     { icon: '❓', title: 'Help Center',      body: "FAQs, guides, and tips to get the most out of CodeHub. Can't find an answer? Contact us directly." },
    community:      { icon: '💬', title: 'Community',        body: 'Join fellow learners, share your progress, ask questions, and grow together.' },
    reportBug:      { icon: '🐛', title: 'Report a Bug',     body: "Found something broken? Tell us and we'll squash it ASAP. Every report makes CodeHub better!" },
    featureRequest: { icon: '💡', title: 'Feature Request',  body: "Got a cool idea? We're all ears. Submit your suggestion — it might make it into the next update!" },
    roadmap:        { icon: '🗺️', title: 'Roadmap',          body: 'Coming soon: Mobile apps, Python & JavaScript courses, AI-powered hints, and multiplayer code battles.' },
    privacy:        { icon: '🔒', title: 'Privacy Policy',   body: 'We collect only what we need to save your progress and streak. No selling data, no ads, ever.' },
    terms:          { icon: '📄', title: 'Terms of Service', body: "By using CodeHub, you agree to learn code and not be mean about it. That's basically it." },
    cookies:        { icon: '🍪', title: 'Cookie Policy',    body: 'We use cookies to keep you logged in and remember your preferences. No third-party tracking cookies.' },
    accessibility:  { icon: '♿', title: 'Accessibility',    body: 'CodeHub is built to be usable by everyone. If you encounter any barriers, please let us know.' },
    resetPassword:  { icon: '🔑', title: 'Reset Password',   body: "Password reset via email is coming soon. For now, contact us and we'll sort it out manually." },
  };

  showPopup(key: string): void { this.popup = this.info[key] ?? null; }
  closePopup(): void { this.popup = null; }
}
