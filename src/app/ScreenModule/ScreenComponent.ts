import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { UserService } from '../CoreModule/UserService';
import { Router } from '@angular/router'

@Component({
    selector: "app-screen",
    standalone: true,
    templateUrl: "./ScreenComponent.html",
    styleUrls: ["./ScreenComponent.css"] 
})

export class ScreenComponent {
    cdr = inject(ChangeDetectorRef);
    name: string = '';
    auth = inject(Auth);
    userService = inject(UserService);
    router = inject(Router);
    
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