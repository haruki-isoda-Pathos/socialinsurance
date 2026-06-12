import { Injectable } from '@angular/core';
import {
    Firestore,
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    deleteDoc,
    collectionGroup,
} from '@angular/fire/firestore';
import { Employee } from '../ModelModule/EmployeeModel';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
    constructor(private firestore: Firestore) {}

    async createEmployee(employee: Employee) {
        const employeeRef = doc(
            this.firestore,
            'employees',
            employee.employeeId,
            'applicabledate',
            employee.applicabledate,
        );
        const snapshot = await getDoc(employeeRef);
        if (snapshot.exists()) {
            throw new Error('従業員情報が既に存在します');
        }
        await setDoc(employeeRef, employee);
    }

    async updateEmployee(employee: Employee) {
        const employeeRef = doc(
            this.firestore,
            'employees',
            employee.employeeId,
            'applicabledate',
            employee.applicabledate,
        );
        await setDoc(employeeRef, employee);
    }

    async deleteEmployee(employeeId: string) {
        const applicableDates = await getDocs(
            collection(this.firestore, 'employees', employeeId, 'applicabledate'),
        );
        await Promise.all(applicableDates.docs.map((d) => deleteDoc(d.ref)));

        const payments = await getDocs(
            collection(this.firestore, 'employees', employeeId, 'payments'),
        );
        await Promise.all(payments.docs.map((d) => deleteDoc(d.ref)));
    }

    /**
     * 指定した表示年月日時点で有効な従業員情報を返す。
     * 各従業員について applicabledate <= displayDate のうち最も新しいレコードを採用する。
     */
    async getEmployeesByDisplayDate(displayDate: string): Promise<Employee[]> {
        const snapshot = await getDocs(collectionGroup(this.firestore, 'applicabledate'));
        const latestByEmployeeId = new Map<string, Employee>();

        for (const docSnap of snapshot.docs) {
            const data = docSnap.data() as Employee;
            const employeeId = data.employeeId ?? docSnap.ref.parent.parent?.id;
            if (!employeeId || !data.applicabledate) {
                continue;
            }
            if (data.applicabledate > displayDate) {
                continue;
            }

            const existing = latestByEmployeeId.get(employeeId);
            if (!existing || data.applicabledate > existing.applicabledate) {
                latestByEmployeeId.set(employeeId, { ...data, employeeId });
            }
        }

        return Array.from(latestByEmployeeId.values()).sort((a, b) =>
            a.employeeId.localeCompare(b.employeeId),
        );
    }
}
