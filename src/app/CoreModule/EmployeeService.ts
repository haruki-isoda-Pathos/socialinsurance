import { Injectable } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc } from '@angular/fire/firestore';
import { Employee } from '../ModelModule/EmployeeModel'

@Injectable({providedIn: 'root'})

export class EmployeeService {

    constructor(private firestore: Firestore){}

    async createEmployee(employee: Employee){
        const employeeRef = doc(this.firestore, 'employees', employee.employeeId, 'applicabledate', employee.applicabledate);
        const snapshot = await getDoc(employeeRef);
        if(snapshot.exists()){throw new Error('従業員情報が既に存在します')}
        else{
            await setDoc(employeeRef, employee)
        } 
    }

    async updateEmployee(employee: Employee){
        const employeeRef = doc(this.firestore, 'employees', employee.employeeId, 'applicabledate', employee.applicabledate)
        await setDoc(employeeRef, employee)
    }

    async deleteEmployee(employeeId: string){
        const employeeRef = doc(this.firestore, 'employees', employeeId)
        await deleteDoc(employeeRef)
    }

    async getEmployees() {
        const employeeRef = collection(this.firestore, 'employees');
        const snapshot = await getDocs(employeeRef);
        return snapshot.docs.map(doc => doc.data() as Employee)
    }

}