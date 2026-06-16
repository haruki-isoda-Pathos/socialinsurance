import { Injectable } from '@angular/core' 
import { Firestore, doc, getDoc } from '@angular/fire/firestore'

@Injectable({providedIn: 'root'})

export class PremiumService {

    constructor(private firestore: Firestore){}

    async getMonthlyPayment(employeeId: string, yearMonth: string) {
        const paymentRef = doc(this.firestore, 'employees',employeeId, 'payments', yearMonth);
        const snapshot = await getDoc(paymentRef)
        //リストをインポートしてreturnする。
    }

    async getStatus(employeeId: string, yearMonth: string) {
        
    }
    
}