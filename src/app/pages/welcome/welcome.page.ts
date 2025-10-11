import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from 'src/app/provide/auth/auth';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: false,
})
export class WelcomePage implements OnInit {

  constructor(private router: Router, private authSrv: Auth) {}

  async ngOnInit() {
    const isLoggedIn = this.authSrv.getCurrentUserUid();
    
    if (isLoggedIn) {
      this.router.navigate(['/home']);
      return;
    }
    
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
