import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Employee } from '../../../ModelModule/EmployeeModel'
import { EmployeeService } from '../../../CoreModule/EmployeeService' 

@Component({
    selector: 'app-modal-employee',
    standalone: true,
    templateUrl: './EmployeeEditModalComponent.html',
    styleUrls: ['./EmployeeEditModalComponent.css']
})

export class EmployeeEditModalComponent {

    constructor(private employeeService: EmployeeService){}

    @Input() isOpen = false;
    @Input() employee: Employee = {
        name: '',
        employeeId: '',
        birthdate: new Date(),
        joindate: new Date(),
        resigndate: new Date(),
        employmenttype: '',
        dependents: '',
        sidejob: '',
        sidejobincome: null,
        status: ''
    };

    @Output() closeEditModal = new EventEmitter<void>();

    onSubmit(){
        this.employeeService.updateEmployee(this.employee as Employee)
        this.closeEditModal.emit();
    }

    onClose(){
        this.closeEditModal.emit();
    }
    
}