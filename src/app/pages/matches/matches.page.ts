import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IMatch, IPublicProfile } from 'src/app/interfaces/tinder-user'; 
import { TinderService } from 'src/app/services/tinder/tinder-service';

interface IMatchWithProfile {
  match: IMatch;
  profile: IPublicProfile;
  lastMessage?: string;
  lastMessageTime?: number;
}

@Component({
  selector: 'app-matches',
  templateUrl: './matches.page.html',
  styleUrls: ['./matches.page.scss'],
  standalone: false,
})
export class MatchesPage implements OnInit {
  public matches: IMatchWithProfile[] = [];
  public isLoading = true;

  constructor(
    private tinderSrv: TinderService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.loadMatches();
  }

  private async loadMatches() {
    try {
      this.isLoading = true;
      const matchesData = await this.tinderSrv.getMatches();
      
      const results = await Promise.all(
        matchesData.map(async (match: IMatch) => { 
          const currentUid = this.tinderSrv['authSrv'].getCurrentUserUid();
           if (!match.participants || !Array.isArray(match.participants)) {
          console.warn('Match sin participants:', match);
          return null;
        }
          const matchedUserId = match.participants.find((id: string) => id !== currentUid) ; 
            if (!matchedUserId) {
          console.warn('No se encontró matchedUserId:', match);
          return null;
        }

          const profile = await this.tinderSrv.getUserProfile(matchedUserId);
           if (!profile) {
          console.warn('No se encontró perfil:', matchedUserId);
          return null;
        }
          return {
            match,  
            profile,
            lastMessage: '',
            lastMessageTime: match.matchedAt
          };
        })
      );
      
          this.matches = results.filter(m => m !== null) as IMatchWithProfile[];

      this.matches.sort((a, b) => 
        (b.lastMessageTime || 0) - (a.lastMessageTime || 0)
      );
      
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      this.isLoading = false;
    }
  }

  openChat(match: IMatchWithProfile) {
    this.router.navigate(['/chat', match.match.chatId], {
      queryParams: {
        matchedUserId: match.profile.uid,
        matchedUserName: match.profile.name,
        matchedUserPhoto: match.profile.photos[0]
      }
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  formatTime(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  }

  async refreshMatches(event?: any) {
    await this.loadMatches();
    if (event) {
      event.target.complete();
    }
  }
}