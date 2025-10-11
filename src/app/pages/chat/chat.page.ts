import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IMessage } from 'src/app/interfaces/tinder-user';
import { TinderService } from 'src/app/services/tinder/tinder-service';
import { NativeToast } from 'src/app/core/providers/nativeToast/native-toast';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
  standalone: false,
})
export class ChatPage implements OnInit, OnDestroy {
  @ViewChild('messageContainer', { read: ElementRef }) messageContainer!: ElementRef;

  public chatId: string = '';
  public matchedUserId: string = '';
  public matchedUserName: string = '';
  public matchedUserPhoto: string = '';
  public messages: IMessage[] = [];
  public newMessage: string = '';
  public currentUserId: string = '';
  private unsubscribe: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tinderSrv: TinderService,
    private toast: NativeToast
  ) {}

  async ngOnInit() {
    this.chatId = this.route.snapshot.paramMap.get('chatId') || '';
    this.matchedUserId = this.route.snapshot.queryParamMap.get('matchedUserId') || '';
    this.matchedUserName = this.route.snapshot.queryParamMap.get('matchedUserName') || '';
    this.matchedUserPhoto = this.route.snapshot.queryParamMap.get('matchedUserPhoto') || '';

    this.currentUserId = this.tinderSrv['authSrv'].getCurrentUserUid() || '';

    if (!this.chatId) {
      await this.toast.show('Error: No chat ID');
      this.goBack();
      return;
    }

    this.subscribeToMessages();
  }

  ngOnDestroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  private subscribeToMessages() {
    this.unsubscribe = this.tinderSrv.subscribeToMessages(
      this.chatId,
      (messages: IMessage[]) => {
        this.messages = messages;
        setTimeout(() => this.scrollToBottom(), 100);
      }
    );
  }

  async sendMessage() {
    if (!this.newMessage.trim()) return;

    try {
      await this.tinderSrv.sendMessage(
        this.chatId,
        this.matchedUserId,
        this.newMessage.trim()
      );
      this.newMessage = '';
      this.scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      await this.toast.show('Error sending message');
    }
  }

  isMyMessage(message: IMessage): boolean {
    return message.senderId === this.currentUserId;
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  private scrollToBottom() {
    try {
      if (this.messageContainer) {
        const element = this.messageContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling:', err);
    }
  }

  goBack() {
    this.router.navigate(['/matches']);
  }
}