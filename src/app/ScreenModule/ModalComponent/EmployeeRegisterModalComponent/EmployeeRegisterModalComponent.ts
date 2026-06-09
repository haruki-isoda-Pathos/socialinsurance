import { Component, Input, Output, EventEmitter } from "@angular/core";
import { EmployeeService } from '../../../CoreModule/EmployeeService';
import { Employee } from '../../../ModelModule/EmployeeModel';

@Component({
    selector: 'app-modal-employee',
    standalone: true,
    templateUrl: './ModalComponent.html',
    styleUrls:['./ModalComponent.css']
})

export class ModalComponent {

    constructor(private employeeService: EmployeeService){}
    
    @Input() isOpen: boolean = false;
    @Output() closeModal = new EventEmitter<void>();

    name: string = '';
    employeeId: string = '';
    birthdate: Date = new Date();
    joindate: Date = new Date();
    resigndate: Date = new Date();
    employmenttype: string = '';
    dependents: string = '';
    sidejob: string = '';
    sidejobincome: number | null = null;
    status: string = '';

    onSubmit() {
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
        }
        this.employeeService.createEmployee(newEmployee as Employee)
        this.closeModal.emit();
    }
    
    onClose() {
        this.closeModal.emit();
    }

}