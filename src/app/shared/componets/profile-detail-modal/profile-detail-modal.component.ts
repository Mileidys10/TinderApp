import { Component, Input, ViewChild, ElementRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { IPublicProfile } from 'src/app/interfaces/tinder-user';

@Component({
  selector: 'app-profile-detail-modal',
  templateUrl: './profile-detail-modal.component.html',
  styleUrls: ['./profile-detail-modal.component.scss'],
  standalone: false,
})
export class ProfileDetailModalComponent {
  @ViewChild('photoSlider', { read: ElementRef }) photoSlider!: ElementRef;
  
  @Input() profile!: IPublicProfile;
  
  public currentPhotoIndex = 0;

  constructor(private modalController: ModalController) {}

  dismiss() {
    this.modalController.dismiss();
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

  onSlideChange(event: any) {
    event.target.getActiveIndex().then((index: number) => {
      this.currentPhotoIndex = index;
    });
  }

  nextPhoto() {
    if (this.currentPhotoIndex < (this.profile.photos?.length || 0) - 1) {
      this.currentPhotoIndex++;
      this.photoSlider.nativeElement.swiper.slideNext();
    }
  }

  prevPhoto() {
    if (this.currentPhotoIndex > 0) {
      this.currentPhotoIndex--;
      this.photoSlider.nativeElement.swiper.slidePrev();
    }
  }
}