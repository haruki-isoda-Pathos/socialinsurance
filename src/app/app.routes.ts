import { Routes } from '@angular/router';
import { LoginComponent } from './AuthModule/LoginComponent/LoginComponent';
import { InitialAdminSetupComponent } from './AuthModule/InitialAdminSetupComponent/InitialAdminSetupComponent';
import { ScreenComponent } from './ScreenModule/ScreenComponent';
import { EmployeeHomeComponent } from './ScreenModule/EmployeeHomeComponent/EmployeeHomeComponent'
import { InsuranceRateSettingsComponent } from './ScreenModule/InsuranceRateSettingsComponent/InsuranceRateSettingsComponent'
import { PremiumIndividualComponent } from './ScreenModule/PremiumIndividualComponent/PremiumIndividualComponent'
import { authGuard } from './CoreModule/AuthGuard';

export const routes: Routes = [
  {
    path:'',
    redirectTo:'initial-admin-setup',
    pathMatch:'full'
  },

  {
    path:'login',
    component: LoginComponent
  },

  {
    path:'initial-admin-setup',
    component: InitialAdminSetupComponent
  },

  {
    path:'admin',
    component: ScreenComponent,
    canActivate: [authGuard],
    children: [
      {
        path:'employees',
        component: EmployeeHomeComponent
      },
      {
        path: 'insurance',
        component: InsuranceRateSettingsComponent
      },
      {
        path: 'insurance-individual',
        component: PremiumIndividualComponent
      }
    ]
  }
];