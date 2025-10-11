import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Loading } from 'src/app/core/providers/loading/loading';
import { NativeToast } from 'src/app/core/providers/nativeToast/native-toast';
import { User } from 'src/app/services/user/user';
import { File } from 'src/app/provide/provide/file';
import { Uploader } from 'src/app/core/providers/uploader/uploader';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {
  public name!: FormControl;
  public lastName!: FormControl;
  public email!: FormControl;
  public password!: FormControl;
  public birthDate!: FormControl;
  public country!: FormControl;
  public city!: FormControl;
  public gender!: FormControl;
  public bio!: FormControl;
  public registerForm!: FormGroup;

  public countries = ['Colombia', 'USA', 'Mexico', 'Argentina', 'Spain', 'Other'];
  public genders = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  public selectedPassions: string[] = [];
  public availablePassions = [
    'Travel', 'Music', 'Movies', 'Fitness', 'Reading', 
    'Cooking', 'Photography', 'Gaming', 'Art', 'Sports',
    'Fashion', 'Technology', 'Food', 'Animals', 'Nature'
  ];

  public uploadedPhotos: string[] = [];
  public photoDataURIs: string[] = [];

  constructor(
    private router: Router,
    private loadingSrv: Loading,
    private userSrv: User,
    private toast: NativeToast,
    private fileSrv: File,
    private uploaderSrv: Uploader
  ) {}

  ngOnInit() {
    this.initForm();
  }

  public initForm() {
    this.name = new FormControl('', [Validators.required]);
    this.lastName = new FormControl('', [Validators.required]);
    this.email = new FormControl('', [Validators.required, Validators.email]);
    this.password = new FormControl('', [Validators.required, Validators.minLength(8)]);
    this.birthDate = new FormControl('', [Validators.required]);
    this.country = new FormControl('Colombia', [Validators.required]);
    this.city = new FormControl('', [Validators.required]);
    this.gender = new FormControl('', [Validators.required]);
    this.bio = new FormControl('');
    
    this.registerForm = new FormGroup({
      name: this.name,
      lastName: this.lastName,
      email: this.email,
      password: this.password,
      birthDate: this.birthDate,
      country: this.country,
      city: this.city,
      gender: this.gender,
      bio: this.bio
    });
  }

  togglePassion(passion: string) {
    const index = this.selectedPassions.indexOf(passion);
    if (index > -1) {
      this.selectedPassions.splice(index, 1);
    } else {
      if (this.selectedPassions.length < 5) {
        this.selectedPassions.push(passion);
      } else {
        this.toast.show('Maximum 5 passions allowed');
      }
    }
  }

  isPassionSelected(passion: string): boolean {
    return this.selectedPassions.includes(passion);
  }

  async pickPhoto() {
    if (this.uploadedPhotos.length >= 6) {
      await this.toast.show('Maximum 6 photos allowed');
      return;
    }

    try {
      await this.loadingSrv.present({ msg: 'Uploading photo...' });
      
      const image = await this.fileSrv.pickImage();
      
      const fileName = `${Date.now()}_${this.email.value || 'user'}.jpg`;
      
      const path = await this.uploaderSrv.upload(
        'profile-photos',
        fileName,
        image.mimeType,
        image.data
      );

      if (path) {
        const url = await this.uploaderSrv.getUrl('profile-photos', path);
        this.uploadedPhotos.push(url);
        
        this.photoDataURIs.push(`data:${image.mimeType};base64,${image.data}`);
        
        await this.toast.show('Photo uploaded successfully!');
      } else {
        throw new Error('Failed to upload photo');
      }
      
    } catch (error) {
      console.error('Error uploading photo:', error);
      await this.toast.show('Error uploading photo');
    } finally {
      await this.loadingSrv.dimiss();
    }
  }

  removePhoto(index: number) {
    this.uploadedPhotos.splice(index, 1);
    this.photoDataURIs.splice(index, 1);
  }

  public async doRegister() {
    if (this.registerForm.invalid) {
      await this.toast.show('Please fill all required fields');
      return;
    }

    if (this.selectedPassions.length < 3) {
      await this.toast.show('Please select at least 3 passions');
      return;
    }

    if (this.uploadedPhotos.length === 0) {
      await this.toast.show('Please upload at least 1 photo');
      return;
    }

    await this.loadingSrv.present({ msg: 'Creating account...' });

    try {
      const formValue = this.registerForm.value;
      
      const userData = {
        ...formValue,
        passions: this.selectedPassions.map(p => ({ category: p })),
        showGenderProfile: true,
        photos: this.uploadedPhotos 
      };

      await this.userSrv.create(userData);
      
      await this.toast.show('Account created successfully!');
      this.registerForm.reset();
      this.router.navigate(['/login']);
      
    } catch (error) {
      console.error('Error creating account:', error);
      await this.toast.show('Error creating account. Please try again.');
    } finally {
      await this.loadingSrv.dimiss();
    }
  }
}