import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { User } from '../ModelModule/UserModel'

@Injectable({providedIn:'root'})

export class UserService {
    constructor(private firestore: Firestore){}

    async createAdminUser(uid:string,name:string,employeeId:string){
        const userRef = doc(this.firestore, 'users', uid);
        await setDoc(userRef, {name, employeeId, role: 'admin', createdAt: new Date(),})
    }

    async getUser(uid:string): Promise<User>{
        const userRef = doc(this.firestore, 'users', uid);
        const snapshot = await getDoc(userRef);
        if(!snapshot.exists()){throw new Error('ユーザー情報なし')}
        return {uid, ...(snapshot.data() as Omit<User, 'uid'>)};
    }

}