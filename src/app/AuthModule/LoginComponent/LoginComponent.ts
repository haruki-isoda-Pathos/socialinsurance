import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../CoreModule/AuthService';
import { UserService } from '../../CoreModule/UserService';
import { Router } from '@angular/router';

@Component({
    selector:'app-login',
    standalone: true,
    imports: [FormsModule],
    templateUrl:'./LoginComponent.html',
    styleUrls:['./LoginComponent.css']
})

export class LoginComponent{
    employeeId:string = '';
    password:string = '';
    error:string = '';

    constructor(
        private authService:AuthService,
        private userService:UserService,
        private router:Router
    ){}

    async onsubmit(){
        try{
           const firebaseUser =await this.authService.login(this.employeeId, this.password);
           const user = await this.userService.getUser(firebaseUser.uid);
           console.log(user);
           this.router.navigate(['/admin']);
           }
        catch(error){
            this.error = 'ログインに失敗しました'
        }
    }

    onBackOff(){
        this.router.navigate(['/initial-admin-setup']);
    }
}