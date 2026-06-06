import { Routes } from '@angular/router';
import { LoginComponent } from './AuthModule/LoginComponent/LoginComponent';
import { InitialAdminSetupComponent } from './AuthModule/InitialAdminSetupComponent/InitialAdminSetupComponent';
import { EmployeeHomeComponent } from './EmployeeModule/EmployeeHome/EmployeeHomeComponent';
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
    component: EmployeeHomeComponent,
    canActivate: [authGuard]
  }
];