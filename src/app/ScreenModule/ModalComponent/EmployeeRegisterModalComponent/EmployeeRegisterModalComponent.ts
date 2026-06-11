import { Component, Output, EventEmitter } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { EmployeeService } from '../../../CoreModule/EmployeeService';
import { Employee } from '../../../ModelModule/EmployeeModel';

@Component({
    selector: 'app-modal-employee-register',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './EmployeeRegisterModalComponent.html',
    styleUrls:['./EmployeeRegisterModalComponent.css']
})

export class EmployeeRegisterModalComponent {

    constructor(private employeeService: EmployeeService){}
    
    @Output() closeModal = new EventEmitter<void>();

    name: string = '';
    employeeId: string = '';
    birthdate: string = '';
    joindate: string = '';
    resigndate: string = '';
    employmenttype: string = '';
    dependents: string = '';
    sidejob: string = '';
    sidejobincome: number | null = null;
    status: string = '';

    async onSubmit(f: NgForm) {
        if (f.invalid) {
            alert('すべての項目を入力して下さい');
            return;
        }
        const newEmployee = {
            name: this.name,
            employeeId: this.employeeId,
            birthdate: this.birthdate,
            joindate: this.joindate,
            resigndate: this.resigndate,
            employmenttype: this.employmenttype,
            dependents: this.dependents,
            sidejob: this.sidejob,
            sidejobincome: this.sidejobincome,
            status: this.status,
        };
        try {
            await this.employeeService.createEmployee(newEmployee as Employee);
            this.closeModal.emit();
        } catch {
            alert('従業員の登録に失敗しました。IDが重複している可能性があります。');
        }
    }
    
    onClose() {
        this.closeModal.emit();
    }

}