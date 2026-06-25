import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../../CoreModule/EmployeeService';
import { Employee } from '../../ModelModule/EmployeeModel';
import { EmployeeRegisterModalComponent } from '../ModalComponent/EmployeeRegisterModalComponent/EmployeeRegisterModalComponent';
import { EmployeeEditModalComponent } from '../ModalComponent/EmployeeEditModalComponent/EmployeeEditModalComponent';
import { PaymentRegisterModalComponent } from '../ModalComponent/PaymentRegisterModalComponent/PaymentRegisterModalComponent';

@Component({
    selector: 'app-employee-home',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        EmployeeRegisterModalComponent,
        EmployeeEditModalComponent,
        PaymentRegisterModalComponent,
    ],
    templateUrl: './EmployeeHomeComponent.html',
    styleUrls: ['./EmployeeHomeComponent.css'],
})
export class EmployeeHomeComponent implements OnInit {
    employeeService = inject(EmployeeService);
    isModalOpen = false;
    isEditModalOpen = false;
    isPaymentModalOpen = false;
    isDeleteModalOpen = false;
    employees: Employee[] = [];
    selectedEmployee: Employee | null = null;
    displayDate = this.formatDate(new Date());

    constructor(private cdr: ChangeDetectorRef) {}

    statusList: Record<string, string> = {
        active1: '従事中',
        active2: '従事中（養育期間特例適用中）',
        resigning: '退職予定',
        resigned: '退職',
        inactive: '休職',
        inactive1: '特別休職(育休)',
        inactive2: '特別休職(産休)',
        inactive3: '特別休職(育休+産休)',
    };

    async onRegisterEmployee() {
        this.isModalOpen = true;
    }

    async onCloseModal() {
        this.isModalOpen = false;
        await this.loadEmployees();
    }

    async onEditEmployee(employee: Employee) {
        this.selectedEmployee = {
            ...employee,
            hasSideJob: employee.hasSideJob ?? false,
            sideJobEmploymenttype: employee.sideJobEmploymenttype ?? '',
        };
        this.isEditModalOpen = true;
    }

    async onCloseEditModal() {
        this.isEditModalOpen = false;
        this.selectedEmployee = null;
        await this.loadEmployees();
    }

    async onOpenPaymentModal(employee: Employee) {
        this.selectedEmployee = { ...employee };
        this.isPaymentModalOpen = true;
    }

    async onClosePaymentModal() {
        this.isPaymentModalOpen = false;
        this.selectedEmployee = null;
    }

    async onDeleteEmployeeDialog(employee: Employee) {
        this.isDeleteModalOpen = true;
        this.selectedEmployee = employee;
    }

    async onCloseDeleteModal() {
        this.isDeleteModalOpen = false;
        this.selectedEmployee = null;
    }

    async onDeleteEmployee() {
        if (!this.selectedEmployee) return;
        try {
            await this.employeeService.deleteEmployee(this.selectedEmployee.employeeId);
            this.isDeleteModalOpen = false;
            this.selectedEmployee = null;
            await this.loadEmployees();
        } catch {
            alert('従業員の削除に失敗しました。');
        }
    }

    async onApplyDisplayDate() {
        await this.loadEmployees();
    }

    async ngOnInit() {
        await this.loadEmployees();
    }

    private async loadEmployees() {
        this.employees = await this.employeeService.getEmployeesByDisplayDate(this.displayDate);
        this.cdr.detectChanges();
    }

    private formatDate(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
}
