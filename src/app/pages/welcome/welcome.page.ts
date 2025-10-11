import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: false,
})
export class WelcomePage implements OnInit {

  constructor(private router: Router) {}

  ngOnInit() {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    if (hasSeenWelcome) {
      this.router.navigate(['/login']);
    }
  }

  goToRegister() {
    localStorage.setItem('hasSeenWelcome', 'true');
    this.router.navigate(['/register']);
  }

  goToLogin() {
    localStorage.setItem('hasSeenWelcome', 'true');
    this.router.navigate(['/login']);
  }
}
