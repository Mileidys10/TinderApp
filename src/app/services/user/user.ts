import { Injectable } from '@angular/core';
import { Auth } from 'src/app/provide/auth/auth';
import { Query } from 'src/app/provide/query/query';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { ITinderUser } from 'src/app/interfaces/tinder-user';

@Injectable({
  providedIn: 'root'
})
export class User {

  constructor(
    private readonly authSrv: Auth,
    private readonly querySrv: Query,
    private readonly firestore: Firestore,
  ) {}

 
  async create(userData: any): Promise<void> {
    try {
      const uid = await this.authSrv.register(userData.email, userData.password);
      
      if (!uid) throw new Error('Failed to create user');

      const age = this.calculateAge(userData.birthDate);

      const userDoc: Partial<ITinderUser> = {
        uid,
        name: userData.name,
        lastName: userData.lastName,
        birthDate: userData.birthDate,
        email: userData.email,
        country: userData.country || '',
        city: userData.city || '',
        gender: userData.gender,
        showGenderProfile: userData.showGenderProfile ?? true,
        passions: userData.passions || [],
        photos: userData.photos || [],
        bio: userData.bio || '',
        age
      };

      await this.querySrv.set("users", uid, userDoc);
      await this.logOut(); 
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }


  public async UpdateUser(data: Partial<ITinderUser>, value?: any) {
    try {
      const uuid = this.getCurrentuid();
      if (!uuid) throw new Error('User not authenticated');
      
      if (data.birthDate) {
        data.age = this.calculateAge(data.birthDate);
      }

      await this.querySrv.update('users', uuid, data);
      return uuid;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

 
  public async addPhoto(photoUrl: string): Promise<void> {
    try {
      const uuid = this.getCurrentuid();
      if (!uuid) throw new Error('User not authenticated');

      const userData = await this.getUserData();
      const currentPhotos = userData?.photos || [];

      if (currentPhotos.length >= 6) {
        throw new Error('Maximum 6 photos allowed');
      }

      const updatedPhotos = [...currentPhotos, photoUrl];

      await this.querySrv.update('users', uuid, {
        photos: updatedPhotos
      });

    } catch (error) {
      console.error('Error adding photo:', error);
      throw error;
    }
  }

 
  public async removePhoto(photoUrl: string): Promise<void> {
    try {
      const uuid = this.getCurrentuid();
      if (!uuid) throw new Error('User not authenticated');

      const userData = await this.getUserData();
      if (!userData || !userData.photos) return;

      const updatedPhotos = userData.photos.filter(
        photo => photo !== photoUrl
      );

      await this.querySrv.update('users', uuid, {
        photos: updatedPhotos
      });

    } catch (error) {
      console.error('Error removing photo:', error);
      throw error;
    }
  }

 
  public async updatePassions(passions: string[]): Promise<void> {
    try {
      const uuid = this.getCurrentuid();
      if (!uuid) throw new Error('User not authenticated');

      const passionsArray = passions.map(p => ({ category: p }));

      await this.querySrv.update('users', uuid, {
        passions: passionsArray
      });

    } catch (error) {
      console.error('Error updating passions:', error);
      throw error;
    }
  }

 
  public async getUserData(): Promise<ITinderUser | null> {
    try {
      const uuid = this.getCurrentuid();
      if (!uuid) return null;

      const userDoc = doc(this.firestore, 'users', uuid);
      const userSnapshot = await getDoc(userDoc);

      if (userSnapshot.exists()) {
        return userSnapshot.data() as ITinderUser;
      }
      return null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  
  private calculateAge(birthDate: string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  public getCurrentuid() {
    return this.authSrv.getCurrentUserUid();
  }

  async logIn(email: string, password: string) {
    await this.authSrv.logIn(email, password);
  }

  async logOut() {
    await this.authSrv.logOut();
  }
}