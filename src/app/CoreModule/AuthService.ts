import{ Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';

@Injectable({
    providedIn:'root'
})

export class AuthService{

    constructor(private auth: Auth){}

    async registerAdmin(employeeId:string,password:string){
    const credential = await createUserWithEmailAndPassword(
      this.auth,
      employeeId,
      password
    );
    return credential.user;
   } 

   async registerEmployee(employeeId:string,password:string){
    const credential = await createUserWithEmailAndPassword(
        this.auth,
        employeeId,
        password
    )
    return credential.user;
   }

   async login(employeeId:string,password:string){
    const credential =
      await signInWithEmailAndPassword(
        this.auth,
        employeeId,
        password
      );

    return credential.user;
}
}
