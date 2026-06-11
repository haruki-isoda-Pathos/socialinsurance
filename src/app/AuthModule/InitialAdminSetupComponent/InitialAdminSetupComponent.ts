import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../CoreModule/AuthService';
import { UserService } from '../../CoreModule/UserService';
import { Router } from '@angular/router'
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';

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
        private firestore:Firestore,
        private authService:AuthService,
        private userService:UserService,
        private router:Router
    ){}

     checkPasswordMatch(){
        this.isPasswordMatch = this.password === this.confirmPassword;
    }

    async existsEmployeeId(employeeId: string): Promise<boolean> {
        const userRef = collection(this.firestore, 'users');
        const q = query(
          userRef,
          where('employeeId', '==', employeeId)
        );
        const snapshot = await getDocs(q);
        return !snapshot.empty;
      }

    async onsubmit(){
        if (!this.isPasswordMatch){
            alert('パスワードが確認用のものと一致しません');
            return;
        }

        const exists = await this.existsEmployeeId(this.employeeId);
        if (exists){
            alert('すでに存在しているユーザーです');
            return;
        }

        const user = await this.authService.registerAdmin(this.employeeId,this.password);
        await this.userService.createAdminUser(
        user.uid,
        this.name,
        this.employeeId
        );
        this.router.navigate(['/login']);
    }

    onLogin(){
        this.router.navigate(['/login']);
    }

} 