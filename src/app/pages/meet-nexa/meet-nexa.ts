import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NexaRive } from '../../shared/nexa-rive/nexa-rive';

@Component({
  selector: 'app-meet-nexa',
  imports: [NexaRive],
  templateUrl: './meet-nexa.html',
  styleUrl: './meet-nexa.css'
})
export class MeetNexa implements OnInit {
  courseId: number = 1;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.courseId = Number(this.route.snapshot.queryParamMap.get('course')) || 1;
  }

  back()     { this.router.navigate(['/choose']); }
  continue() { this.router.navigate(['/courses', this.courseId, 'lessons']); }
}
