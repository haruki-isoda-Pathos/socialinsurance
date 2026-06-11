import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Employee } from '../../../ModelModule/EmployeeModel'
import { EmployeeService } from '../../../CoreModule/EmployeeService' 

@Component({
    selector: 'app-modal-employee',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './EmployeeEditModalComponent.html',
    styleUrls: ['./EmployeeEditModalComponent.css']
})

export class EmployeeEditModalComponent {

    constructor(private employeeService: EmployeeService){}

    @Input() employee: Employee = {
        name: '',
        employeeId: '',
        birthdate: '',
        joindate: '',
        resigndate: '',
        employmenttype: '',
        dependents: '',
        sidejob: '',
        sidejobincome: null,
        status: ''
    };

    @Output() closeEditModal = new EventEmitter<void>();

    async onSubmit(f: NgForm){
        if (f.invalid) {
            alert('すべての項目を入力して下さい');
            return;
        }
        try {
            await this.employeeService.updateEmployee(this.employee as Employee);
            this.closeEditModal.emit();
        } catch {
            alert('従業員情報の更新に失敗しました。');
        }
    }

    onClose(){
        this.closeEditModal.emit();
    }
    
}