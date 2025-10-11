
import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
@Component({
  selector: 'app-match-modal',
  templateUrl: './match-modal.component.html',
  styleUrls: ['./match-modal.component.scss'],
  standalone: false,
})
export class MatchModalComponent {
  @Input() matchedUserName: string = '';
  @Input() matchedUserPhoto: string = '';
  @Input() chatId: string = '';
  @Input() matchedUserId: string = '';

  constructor(
    private modalController: ModalController,
    private router: Router
  ) {}

  async dismiss() {
    await this.modalController.dismiss();
  }

  async sendMessage() {
    await this.modalController.dismiss();
    this.router.navigate(['/chat', this.chatId], {
      queryParams: {
        matchedUserId: this.matchedUserId,
        matchedUserName: this.matchedUserName,
        matchedUserPhoto: this.matchedUserPhoto
      }
    });
  }

  async keepSwiping() {
    await this.modalController.dismiss();
  }
}