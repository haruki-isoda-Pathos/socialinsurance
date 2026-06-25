import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../CoreModule/AuthService';
import { UserService } from '../../CoreModule/UserService';
import { Router } from '@angular/router';
import { FirebaseError } from '@angular/fire/app';

@Component({
    selector:'app-initial-admin-setup',
    standalone: true,
    imports: [FormsModule, CommonModule],
    templateUrl:'./InitialAdminSetupComponent.html',
    styleUrls:['./InitialAdminSetupComponent.css']
})

export class InitialAdminSetupComponent{

    name:string = '';
    employeeId:string = '';
    password:string = '';
    confirmPassword:string = '';
    isPasswordMatch:boolean = true;
    
    constructor(
        private authService:AuthService,
        private userService:UserService,
        private router:Router
    ){}

     checkPasswordMatch(){
        this.isPasswordMatch = this.password === this.confirmPassword;
    }

    async onsubmit(){
        if (!this.isPasswordMatch){
            alert('パスワードが確認用のものと一致しません');
            return;
        }

        try {
            const user = await this.authService.registerAdmin(this.employeeId, this.password);
            await this.userService.createAdminUser(
                user.uid,
                this.name,
                this.employeeId
            );
            this.router.navigate(['/login']);
        } catch (error) {
            if (error instanceof FirebaseError && error.code === 'auth/email-already-in-use') {
                alert('すでに存在しているユーザーです');
                return;
            }
            alert('アカウント作成に失敗しました。入力内容を確認してください');
        }
    }

    onLogin(){
        this.router.navigate(['/login']);
    }

} 