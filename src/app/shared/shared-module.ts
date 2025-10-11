import { NgModule ,CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
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
import { MatchModalComponent } from './componets/match-modal/match-modal.component';
import { ProfileDetailModalComponent } from './componets/profile-detail-modal/profile-detail-modal.component';



const myModules = [ CommonModule, FormsModule, ReactiveFormsModule, IonicModule, RouterModule,TranslateModule ];
const myComponents = [ InputComponent, ButtonComponent, ToggleTranslateComponent, LinkComponent, CardComponent, FloatingButtonComponent,MatchModalComponent,ProfileDetailModalComponent ];
const myProviders = [ User,ActionSheet,WallpaperService,TinderService ];
@NgModule({
  declarations: [
    ...myComponents,
   

  ],
providers:[...myProviders],

  imports: [
    ...myModules

  ],

  exports:[...myModules,...myComponents],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class SharedModule { }
