import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { NexaRive } from '../../shared/nexa-rive/nexa-rive';

interface PopupInfo { icon: string; title: string; body: string; }

@Component({
  selector: 'app-home',
  imports: [RouterLink, Navbar, NexaRive],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  popup: PopupInfo | null = null;

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
    resetPassword:  { icon: '🔑', title: 'Reset Password',   body: 'Password reset via email is coming soon. For now, contact us and we\'ll sort it out manually.' },
  };

  showPopup(key: string): void { this.popup = this.info[key] ?? null; }
  closePopup(): void { this.popup = null; }
}
