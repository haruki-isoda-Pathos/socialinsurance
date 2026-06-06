import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { UserService } from '../../CoreModule/UserService';

@Component({
    selector: 'app-employee-home',
    standalone: true,
    templateUrl: './EmployeeHomeComponent.html',
    styleUrls:['./EmployeeHomeComponent.css']
})

export class EmployeeHomeComponent{

    cdr = inject(ChangeDetectorRef);
    name: string = '';
    auth = inject(Auth);
    userService = inject(UserService);

    async ngOnInit() {

        const currentUser = this.auth.currentUser;
      
        if (!currentUser) {
          return;
        }
      
        const user = await this.userService.getUser(
          currentUser.uid
        );
      
        this.name = user.name;

        this.cdr.detectChanges();
      }
}