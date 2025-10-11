import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from './componets/input/input.component';
import { ButtonComponent } from './componets/button/button.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { User } from '../services/user/user';
import { ActionSheet } from '../core/providers/actionSheet/action-sheet';
import { ToggleTranslateComponent } from './componets/toggle-translate/toggle-translate.component';
import { LinkComponent } from './componets/link/link.component';
import { CardComponent } from './componets/card/card.component';
import { FloatingButtonComponent } from './componets/floating-button/floating-button.component';
import { TranslateModule } from '@ngx-translate/core';
import { WallpaperService } from '../services/wallpaper/wallpaper-service';
import { TinderService } from '../services/tinder/tinder-service';



const myModules = [ CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule,TranslateModule ];
const myComponents = [ InputComponent, ButtonComponent, ToggleTranslateComponent, LinkComponent, CardComponent, FloatingButtonComponent ];
const myProviders = [ User,ActionSheet,WallpaperService,TinderService ];
@NgModule({
  declarations: [
    ...myComponents,
   

  ],
providers:[...myProviders],

  imports: [
    ...myModules

  ],

  exports:[...myModules,...myComponents]

})
export class SharedModule { }
