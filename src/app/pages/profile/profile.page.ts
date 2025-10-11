import { Component, OnInit } from '@angular/core';
import { Translate } from 'src/app/core/providers/translator/translate';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/services/user/user';
import { Router } from '@angular/router';
import { NativeToast } from 'src/app/core/providers/nativeToast/native-toast';
import { Loading } from 'src/app/core/providers/loading/loading';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  currentLang = 'en';
  public name!: FormControl;
  public lastName!: FormControl;
  public updaterForm!: FormGroup;
  public isLoading = false;
  public userData: any = null;
  public userPhoto: string = '';

  constructor(
    private translateSrv: Translate,
    private userSrv: User,
    private readonly router: Router,
    private readonly toast: NativeToast,
    private loadingSrv: Loading
  ) {
    this.initForm();
  }

  async ngOnInit() {
    this.currentLang = this.translateSrv.getCurrentLang();
    await this.loadUserData();
  }

  private async loadUserData() {
    try {
      this.isLoading = true;
      this.userData = await this.userSrv.getUserData();
      
      if (this.userData) {
        this.name.setValue(this.userData.name || '');
        this.lastName.setValue(this.userData.lastName || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      await this.toast.show('Error cargando datos del usuario');
    } finally {
      this.isLoading = false;
    }
  }

  private initForm() {
    this.name = new FormControl('', [Validators.required]);
    this.lastName = new FormControl('', [Validators.required]);
    this.updaterForm = new FormGroup({
      name: this.name,
      lastName: this.lastName
    });
  }

  public async onSubmit() {
    if (this.updaterForm.invalid) {
      await this.toast.show('Por favor completa todos los campos');
      return;
    }

    try {
      await this.loadingSrv.present({
        msg: this.translateSrv.instant('PROFILE.UPDATING') || 'Actualizando perfil...'
      });

      await this.userSrv.UpdateUser(this.name.value, this.lastName.value);
      
      await this.toast.show(
        this.translateSrv.instant('PROFILE.UPDATE_SUCCESS') || 'Perfil actualizado correctamente'
      );
      
      await this.loadUserData();
      
    } catch (error) {
      console.error('Error updating profile:', error);
      await this.toast.show(
        this.translateSrv.instant('PROFILE.UPDATE_ERROR') || 'Error al actualizar el perfil'
      );
    } finally {
      await this.loadingSrv.dimiss();
    }
  }

  public goToHome() {
    this.router.navigate(['/home']);
  }

  public setLang(lang: string) {
    this.translateSrv.useLang(lang);
    this.currentLang = lang;
  }

  public async refreshUserData(event?: any) {
    await this.loadUserData();
    if (event) {
      event.target.complete();
    }
  }
}