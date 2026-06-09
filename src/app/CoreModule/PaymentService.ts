import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc } from  '@angular/fire/firestore';
import { Payment } from '../ModelModule/PaymentModel';

@Injectable({providedIn: 'root'})

export class PaymentService {
    
    private firestore = inject(Firestore);

    async registerPayment(payment: Payment): Promise<void> {
        const paymentRef = doc(this.firestore, 'employees', payment.employeeId, 'payments', payment.yearMonth);
        await setDoc(paymentRef, payment);
        //paymentについては、上書きも兼ねているので、getDocsガードは作っていません。
    }
    
}