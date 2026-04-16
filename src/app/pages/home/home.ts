import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';
import { NexaRive } from '../../shared/nexa-rive/nexa-rive';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Navbar, NexaRive],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {}
