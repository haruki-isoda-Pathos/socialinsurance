import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, updateDoc } from '@angular/fire/firestore';
import { Payment, TriggerStatus } from '../ModelModule/PaymentModel';

@Injectable({ providedIn: 'root' })
export class PaymentService {

    private firestore = inject(Firestore);

    async registerPayment(payment: Payment): Promise<void> {
        const prevYearMonth = this.getPreviousYearMonth(payment.yearMonth);
        const prevPayment = await this.getPayment(payment.employeeId, prevYearMonth);

        const enriched: Payment = { ...payment };

        if (prevPayment) {
            if (prevPayment.fixedPay !== payment.fixedPay) {
                enriched.mainJobTrigger = 'pending';
            }
            if (
                payment.sidejobincome &&
                prevPayment.sidejobincome &&
                prevPayment.sideJobFixedPay !== payment.sideJobFixedPay
            ) {
                enriched.sideJobTrigger = 'pending';
            }
        }

        const paymentRef = doc(
            this.firestore,
            'employees',
            payment.employeeId,
            'payments',
            payment.yearMonth,
        );
        await setDoc(paymentRef, enriched);
    }

    /** 指定月のトリガーステータスを更新する */
    async updateTriggerStatus(
        employeeId: string,
        yearMonth: string,
        field: 'mainJobTrigger' | 'sideJobTrigger',
        status: TriggerStatus,
    ): Promise<void> {
        const paymentRef = doc(this.firestore, 'employees', employeeId, 'payments', yearMonth);
        await updateDoc(paymentRef, { [field]: status });
    }

    private async getPayment(employeeId: string, yearMonth: string): Promise<Payment | null> {
        const paymentRef = doc(this.firestore, 'employees', employeeId, 'payments', yearMonth);
        const snapshot = await getDoc(paymentRef);
        return snapshot.exists() ? (snapshot.data() as Payment) : null;
    }

    private getPreviousYearMonth(yearMonth: string): string {
        const [year, month] = yearMonth.split('-').map(Number);
        const prevMonth = month === 1 ? 12 : month - 1;
        const prevYear = month === 1 ? year - 1 : year;
        return `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
    }
}
