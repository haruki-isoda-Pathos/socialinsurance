import { Injectable } from '@angular/core';
import {
    Firestore,
    doc,
    getDoc,
    collection,
    getDocs,
    updateDoc,
} from '@angular/fire/firestore';
import { Employee } from '../ModelModule/EmployeeModel';
import { Payment, TriggerStatus } from '../ModelModule/PaymentModel';
import { PremiumAdjustmentService } from './PremiumAdjustmentService';

@Injectable({ providedIn: 'root' })
export class PremiumService {
    employeeAtMonthEnd: Employee | null = null;

    /** 照会月を含む過去24か月分の全支給実績 (yearMonth → Payment) */
    allPayments: Record<string, Payment> = {};

    constructor(
        private firestore: Firestore,
        private premiumAdjustmentService: PremiumAdjustmentService,
    ) {}

    /**
     * 照会月の月末時点で有効な従業員情報（ステータス含む）を取得する。
     */
    async loadEmployeeStatusAtMonth(employeeId: string, yearMonth: string): Promise<void> {
        const monthEnd = this.getMonthEndDate(yearMonth);
        const applicableDatesSnap = await getDocs(
            collection(this.firestore, 'employees', employeeId, 'applicabledate'),
        );

        if (applicableDatesSnap.empty) {
            throw new Error('従業員情報が存在しません');
        }

        let latest: Employee | null = null;
        for (const docSnap of applicableDatesSnap.docs) {
            const data = docSnap.data() as Employee;
            if (!data.applicabledate || data.applicabledate > monthEnd) {
                continue;
            }
            if (!latest || data.applicabledate > latest.applicabledate) {
                latest = { ...data, employeeId: data.employeeId ?? employeeId };
            }
        }

        if (!latest || latest.joindate > monthEnd) {
            throw new Error('従業員情報が存在しません');
        }

        this.employeeAtMonthEnd = latest;
    }

    /**
     * 照会月を含む過去24か月分の支給実績を取得して allPayments に格納する。
     * 退職月（月中退職・同月同喪以外）および退職月以降は、照会月の実績未登録でも照会を許可する。
     */
    async loadAllPayments(employeeId: string, yearMonth: string): Promise<void> {
        const currentPayment = await this.getPayment(employeeId, yearMonth);
        const allowMissing =
            this.employeeAtMonthEnd !== null &&
            this.premiumAdjustmentService.shouldAllowMissingPayment(
                this.employeeAtMonthEnd,
                yearMonth,
            );

        if (!currentPayment && !allowMissing) {
            throw new Error('当該月について支給実績がありません');
        }

        this.allPayments = {};

        const months = this.getPastNMonths(yearMonth, 24);
        for (const ym of months) {
            const payment = await this.getPayment(employeeId, ym);
            if (payment) {
                this.allPayments[ym] = payment;
            }
        }
        if (currentPayment) {
            this.allPayments[yearMonth] = currentPayment;
        }
    }

    /** 指定月のトリガーステータスを Firestore に書き戻す */
    async updateTriggerStatus(
        employeeId: string,
        yearMonth: string,
        field: 'mainJobTrigger' | 'sideJobTrigger',
        status: TriggerStatus,
    ): Promise<void> {
        const paymentRef = doc(
            this.firestore,
            'employees',
            employeeId,
            'payments',
            yearMonth,
        );
        await updateDoc(paymentRef, { [field]: status });
        if (this.allPayments[yearMonth]) {
            this.allPayments[yearMonth] = {
                ...this.allPayments[yearMonth],
                [field]: status,
            };
        }
    }

    private async getPayment(employeeId: string, yearMonth: string): Promise<Payment | null> {
        const paymentRef = doc(this.firestore, 'employees', employeeId, 'payments', yearMonth);
        const snapshot = await getDoc(paymentRef);
        return snapshot.exists() ? (snapshot.data() as Payment) : null;
    }

    /** yearMonth（YYYY-MM）の月末日を YYYY-MM-DD 形式で返す */
    getMonthEndDate(yearMonth: string): string {
        const [year, month] = yearMonth.split('-').map(Number);
        const lastDay = new Date(year, month, 0).getDate();
        return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    }

    /** yearMonth を起点に過去 n ヶ月（yearMonth 自身を除く）の yearMonth 配列を返す */
    private getPastNMonths(yearMonth: string, n: number): string[] {
        const [year, month] = yearMonth.split('-').map(Number);
        const result: string[] = [];
        let y = year;
        let m = month;
        for (let i = 0; i < n; i++) {
            m -= 1;
            if (m === 0) {
                m = 12;
                y -= 1;
            }
            result.unshift(`${y}-${String(m).padStart(2, '0')}`);
        }
        return result;
    }

    /** 照会月に対応する定時改定用 4〜6月の yearMonth 配列を返す */
    getAprJunYearMonths(yearMonth: string): string[] {
        const [year, month] = yearMonth.split('-').map(Number);
        const targetYear = month >= 9 ? year : year - 1;
        return ['04', '05', '06'].map((m) => `${targetYear}-${m}`);
    }

    /** 指定月の翌月から n ヶ月分の yearMonth 配列を返す */
    getFollowingMonths(yearMonth: string, n: number): string[] {
        const [year, month] = yearMonth.split('-').map(Number);
        const result: string[] = [];
        let y = year;
        let m = month;
        for (let i = 0; i < n; i++) {
            m += 1;
            if (m === 13) {
                m = 1;
                y += 1;
            }
            result.push(`${y}-${String(m).padStart(2, '0')}`);
        }
        return result;
    }
}
