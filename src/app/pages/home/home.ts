import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../shared/navbar/navbar';

@Component({
  selector: 'app-home',
  imports: [RouterLink, Navbar],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {}
