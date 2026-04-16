import {
  Component, Input, OnDestroy, AfterViewInit,
  ElementRef, ViewChild, ChangeDetectionStrategy
} from '@angular/core';
import { Rive } from '@rive-app/canvas';

@Component({
  selector: 'app-nexa-rive',
  standalone: true,
  template: `<canvas #canvas [width]="size" [height]="size" [style.width.px]="size" [style.height.px]="size"></canvas>`,
  styles: [':host { display: inline-block; line-height: 0; }'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NexaRive implements AfterViewInit, OnDestroy {
  @Input() size  = 260;
  @Input() stateMachine = '';

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private rive: any;

  ngAfterViewInit() {
    this.rive = new Rive({
      src: 'http://localhost/codehub-api/nexa.riv',
      canvas: this.canvasRef.nativeElement,
      autoplay: true,
      stateMachines: this.stateMachine || undefined,
      onLoad: () => this.rive.resizeDrawingSurfaceToCanvas()
    });
  }

  ngOnDestroy() {
    this.rive?.cleanup();
  }
}
