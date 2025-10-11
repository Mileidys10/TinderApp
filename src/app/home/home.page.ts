import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../services/user/user';
import { NativeToast } from '../core/providers/nativeToast/native-toast';
import { TinderService } from '../services/tinder/tinder-service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit, OnDestroy {
  public userName: string = '';
  public matchesCount: number = 0;
  public isLoading = false;
  private matchesSubscription: any;

  constructor(
    private userSrv: User,
    private router: Router,
    private nativeToast: NativeToast,
    private tinderSrv: TinderService
  ) {}

  async ngOnInit() {
    await this.loadUserData();
    this.subscribeToMatches();
  }

  ngOnDestroy() {
    if (this.matchesSubscription) {
      this.matchesSubscription();
    }
  }

  private async loadUserData() {
    try {
      const userData = await this.userSrv.getUserData();
      if (userData) {
        this.userName = userData.name;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  }

  private subscribeToMatches() {
    this.matchesSubscription = this.tinderSrv.subscribeToMatches((matches) => {
      this.matchesCount = matches.length;
    });
  }

  async ionViewWillEnter() {
    // Refresh matches count when returning to this page
    await this.refreshMatchesCount();
  }

  private async refreshMatchesCount() {
    try {
      const matches = await this.tinderSrv.getMatches();
      this.matchesCount = matches.length;
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  }

  goToMatching() {
    this.router.navigate(['/matching']);
  }

  goToMatches() {
    this.router.navigate(['/matches']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  async logOut() {
    try {
      await this.userSrv.logOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error logging out:', error);
      await this.nativeToast.show('Error al cerrar sesión');
    }
  }
}