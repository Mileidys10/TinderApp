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
  private hasNavigated = false;

  constructor(private router: Router, private authSrv: Auth) {}

  async ngOnInit() {
    const isLoggedIn = this.authSrv.getCurrentUserUid();
    
    if (isLoggedIn) {
      this.router.navigate(['/home']);
      return;
    }
    

  }

  goToRegister() {
    if (!this.hasNavigated) {
      this.hasNavigated = true;
      this.router.navigate(['/register']);
    }
  }

  goToLogin() {
    if (!this.hasNavigated) {
      this.hasNavigated = true;
      this.router.navigate(['/login']);
    }
  }
}