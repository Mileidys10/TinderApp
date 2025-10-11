import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc,
  updateDoc,
  orderBy,
  limit,
  onSnapshot
} from '@angular/fire/firestore';
import { Auth } from 'src/app/provide/auth/auth';
import { IPublicProfile, IMatch, IMessage, IChat } from 'src/app/interfaces/tinder-user';

@Injectable({
  providedIn: 'root'
})
export class TinderService {

  constructor(
    private firestore: Firestore,
    private authSrv: Auth
  ) {}

  // ================== MATCHING ==================
  
  async getAvailableProfiles(): Promise<IPublicProfile[]> {
    try {
      const currentUid = this.authSrv.getCurrentUserUid();
      if (!currentUid) return [];

      // Get users that current user has already liked or passed
      const interactedUsers = await this.getInteractedUserIds(currentUid);
      
      const usersRef = collection(this.firestore, 'users');
      const q = query(usersRef, limit(50)); 
      
      const snapshot = await getDocs(q);
      const profiles: IPublicProfile[] = [];

      snapshot.forEach(doc => {
        const data = doc.data() as IPublicProfile;
        
        // Only show profiles that:
        // 1. Are not the current user
        // 2. Haven't been liked or passed yet
        // 3. Have at least one photo
        if (data.uid !== currentUid && 
            !interactedUsers.includes(data.uid) &&
            data.photos && 
            data.photos.length > 0) { 
          profiles.push(data);
        }
      });

      return this.shuffleArray(profiles);
    } catch (error) {
      console.error('Error getting profiles:', error);
      return [];
    }
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  async likeProfile(likedUserId: string): Promise<boolean> {
    try {
      const currentUid = this.authSrv.getCurrentUserUid();
      if (!currentUid) return false;

      // Save the like
      const likesRef = collection(this.firestore, 'likes');
      await addDoc(likesRef, {
        from: currentUid,
        to: likedUserId,
        timestamp: Date.now()
      });

      // Check if it's a mutual match
      const hasMatch = await this.checkMutualLike(currentUid, likedUserId);
      
      if (hasMatch) {
        await this.createMatch(currentUid, likedUserId);
        return true; 
      }

      return false; 
    } catch (error) {
      console.error('Error liking profile:', error);
      return false;
    }
  }

  async passProfile(passedUserId: string): Promise<void> {
    try {
      const currentUid = this.authSrv.getCurrentUserUid();
      if (!currentUid) return;

      const passesRef = collection(this.firestore, 'passes');
      await addDoc(passesRef, {
        from: currentUid,
        to: passedUserId,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error passing profile:', error);
    }
  }

  private async checkMutualLike(userId: string, likedUserId: string): Promise<boolean> {
    try {
      const likesRef = collection(this.firestore, 'likes');
      const q = query(
        likesRef,
        where('from', '==', likedUserId),
        where('to', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error('Error checking mutual like:', error);
      return false;
    }
  }

  private async createMatch(userId1: string, userId2: string): Promise<void> {
    try {
      const matchesRef = collection(this.firestore, 'matches');
      const chatId = `${userId1}_${userId2}`;
      
      await addDoc(matchesRef, {
        participants: [userId1, userId2],
        chatId,
        matchedAt: Date.now()
      });

      const chatsRef = collection(this.firestore, 'chats');
      await addDoc(chatsRef, {
        chatId,
        participants: [userId1, userId2],
        messages: [],
        lastMessage: '',
        lastMessageTime: Date.now()
      });
    } catch (error) {
      console.error('Error creating match:', error);
    }
  }

  // Get all user IDs that current user has interacted with (liked or passed)
  private async getInteractedUserIds(userId: string): Promise<string[]> {
    try {
      const ids: string[] = [];
      
      // Get liked users
      const likesRef = collection(this.firestore, 'likes');
      const likesQuery = query(likesRef, where('from', '==', userId));
      const likesSnapshot = await getDocs(likesQuery);
      likesSnapshot.forEach(doc => ids.push(doc.data()['to']));

      // Get passed users
      const passesRef = collection(this.firestore, 'passes');
      const passesQuery = query(passesRef, where('from', '==', userId));
      const passesSnapshot = await getDocs(passesQuery);
      passesSnapshot.forEach(doc => ids.push(doc.data()['to']));

      return ids;
    } catch (error) {
      console.error('Error getting interacted users:', error);
      return [];
    }
  }

  // ================== MATCHES & CHAT ==================

  async getMatches(): Promise<IMatch[]> {
    try {
      const currentUid = this.authSrv.getCurrentUserUid();
      if (!currentUid) return [];

      const matchesRef = collection(this.firestore, 'matches');
      const q = query(
        matchesRef,
        where('participants', 'array-contains', currentUid)
      );

      const snapshot = await getDocs(q);
      const matches: IMatch[] = [];

      snapshot.forEach(doc => {
        matches.push({
          matchId: doc.id,
          ...doc.data()
        } as IMatch);
      });

      return matches;
    } catch (error) {
      console.error('Error getting matches:', error);
      return [];
    }
  }

  // Real-time subscription to matches
  subscribeToMatches(callback: (matches: IMatch[]) => void) {
    const currentUid = this.authSrv.getCurrentUserUid();
    if (!currentUid) {
      callback([]);
      return () => {};
    }

    const matchesRef = collection(this.firestore, 'matches');
    const q = query(
      matchesRef,
      where('participants', 'array-contains', currentUid)
    );

    return onSnapshot(q, (snapshot) => {
      const matches: IMatch[] = [];
      snapshot.forEach(doc => {
        matches.push({
          matchId: doc.id,
          ...doc.data()
        } as IMatch);
      });
      callback(matches);
    });
  }

  async sendMessage(chatId: string, receiverId: string, message: string): Promise<void> {
    try {
      const currentUid = this.authSrv.getCurrentUserUid();
      if (!currentUid) return;

      const messagesRef = collection(this.firestore, 'messages');
      await addDoc(messagesRef, {
        chatId,
        senderId: currentUid,
        receiverId,
        message,
        timestamp: Date.now(),
        read: false
      });

      // Update last message in chat
      const chatsRef = collection(this.firestore, 'chats');
      const chatQuery = query(chatsRef, where('chatId', '==', chatId));
      const chatSnapshot = await getDocs(chatQuery);
      
      if (!chatSnapshot.empty) {
        const chatDoc = chatSnapshot.docs[0];
        await updateDoc(doc(this.firestore, 'chats', chatDoc.id), {
          lastMessage: message,
          lastMessageTime: Date.now()
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  subscribeToMessages(chatId: string, callback: (messages: IMessage[]) => void) {
    const messagesRef = collection(this.firestore, 'messages');
    const q = query(
      messagesRef,
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages: IMessage[] = [];
      snapshot.forEach(doc => {
        messages.push({
          messageId: doc.id,
          ...doc.data()
        } as IMessage);
      });
      callback(messages);
    });
  }

  async getUserProfile(userId: string): Promise<IPublicProfile | null> {
    try {
      const userDoc = doc(this.firestore, 'users', userId);
      const snapshot = await getDoc(userDoc);
      
      if (snapshot.exists()) {
        return snapshot.data() as IPublicProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }
}