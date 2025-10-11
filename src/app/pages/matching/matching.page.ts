import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { NativeToast } from 'src/app/core/providers/nativeToast/native-toast';
import { Translate } from 'src/app/core/providers/translator/translate';
import { IPublicProfile } from 'src/app/interfaces/tinder-user';
import { TinderService } from 'src/app/services/tinder/tinder-service';
import { ModalController } from '@ionic/angular';
import { MatchModalComponent } from 'src/app/shared/componets/match-modal/match-modal.component';
import { ProfileDetailModalComponent } from 'src/app/shared/componets/profile-detail-modal/profile-detail-modal.component';

@Component({
  selector: 'app-matching',
  templateUrl: './matching.page.html',
  styleUrls: ['./matching.page.scss'],
  standalone: false,
})
export class MatchingPage implements OnInit {
  @ViewChild('profileCard', { read: ElementRef }) profileCard!: ElementRef;

  public profiles: IPublicProfile[] = [];
  public currentProfileIndex = 0;
  public isLoading = true;
  public noMoreProfiles = false;

  private startX = 0;
  private currentX = 0;
  private isDragging = false;

  constructor(
    private tinderSrv: TinderService,
    private router: Router,
    private toast: NativeToast,
    private translateSrv: Translate,
    private modalController: ModalController
  ) {}

  async ngOnInit() {
    await this.loadProfiles();
  }

  get currentProfile(): IPublicProfile | null {
    return this.profiles[this.currentProfileIndex] || null;
  }

  private async loadProfiles() {
    try {
      this.isLoading = true;
      this.profiles = await this.tinderSrv.getAvailableProfiles();
      
      if (this.profiles.length === 0) {
        this.noMoreProfiles = true;
      }
    } catch (error) {
      console.error('Error loading profiles:', error);
      await this.toast.show('Error cargando perfiles');
    } finally {
      this.isLoading = false;
    }
  }

  async showProfileDetail() {
    if (!this.currentProfile) return;

    const modal = await this.modalController.create({
      component: ProfileDetailModalComponent,
      cssClass: 'profile-detail-modal',
      componentProps: {
        profile: this.currentProfile
      }
    });

    await modal.present();
  }

  onTouchStart(event: TouchEvent) {
    this.startX = event.touches[0].clientX;
    this.isDragging = true;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isDragging) return;
    
    this.currentX = event.touches[0].clientX;
    const deltaX = this.currentX - this.startX;
    
    const card = this.profileCard.nativeElement;
    const rotation = deltaX * 0.05;
    
    card.style.transition = 'none';
    card.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
    
    if (deltaX > 50) {
      card.classList.add('like-overlay');
      card.classList.remove('nope-overlay');
    } else if (deltaX < -50) {
      card.classList.add('nope-overlay');
      card.classList.remove('like-overlay');
    } else {
      card.classList.remove('like-overlay', 'nope-overlay');
    }
  }

  onTouchEnd(event: TouchEvent) {
    if (!this.isDragging) return;
    
    const deltaX = this.currentX - this.startX;
    const card = this.profileCard.nativeElement;
    
    if (Math.abs(deltaX) > 100) {
      if (deltaX > 0) {
        this.animateSwipe('right');
        this.onLike();
      } else {
        this.animateSwipe('left');
        this.onPass();
      }
    } else {
      card.style.transition = 'transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)';
      card.style.transform = 'translateX(0) rotate(0)';
      card.classList.remove('like-overlay', 'nope-overlay');
      
      setTimeout(() => {
        card.style.transition = 'none';
      }, 300);
    }
    
    this.isDragging = false;
    this.startX = 0;
    this.currentX = 0;
  }

  private animateSwipe(direction: 'left' | 'right') {
    const card = this.profileCard.nativeElement;
    const distance = direction === 'right' ? 1000 : -1000;
    
    card.style.transition = 'transform 0.3s ease';
    card.style.transform = `translateX(${distance}px) rotate(${distance * 0.05}deg)`;
    
    setTimeout(() => {
      card.style.transition = 'none';
      card.style.transform = 'translateX(0) rotate(0)';
      card.classList.remove('like-overlay', 'nope-overlay');
    }, 300);
  }

  async onLike() {
    if (!this.currentProfile) return;
    
    const isMatch = await this.tinderSrv.likeProfile(this.currentProfile.uid);
    
    if (isMatch) {
      const matches = await this.tinderSrv.getMatches();
      const currentMatch = matches.find(m => 
        m.participants.includes(this.currentProfile!.uid)
      );
      
      if (currentMatch) {
        await this.showMatchModal(currentMatch.chatId);
      }
    }
    
    this.nextProfile();
  }
  
  async showMatchModal(chatId: string) {
    const modal = await this.modalController.create({
      component: MatchModalComponent,
      cssClass: 'match-modal-class',
      componentProps: {
        matchedUserName: this.currentProfile?.name,
        matchedUserPhoto: this.currentProfile?.photos[0],
        chatId: chatId,
        matchedUserId: this.currentProfile?.uid
      }
    });
    
    await modal.present();
  }

  async onPass() {
    if (!this.currentProfile) return;
    
    await this.tinderSrv.passProfile(this.currentProfile.uid);
    this.nextProfile();
  }

  private nextProfile() {
    this.currentProfileIndex++;
    
    if (this.currentProfileIndex >= this.profiles.length) {
      this.noMoreProfiles = true;
    }
  }

  goToMatches() {
    this.router.navigate(['/matches']);
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
}