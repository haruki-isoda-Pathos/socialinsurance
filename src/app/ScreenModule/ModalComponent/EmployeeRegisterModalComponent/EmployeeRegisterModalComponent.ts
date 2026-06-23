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
    resigndate?: string = '';
    employmenttype: string = '';
    hasSideJob = false;
    sideJobEmploymenttype = '';
    estincome: number | null = null;
    sideJobEstincome: number | null = null;
    dependents: string = '';
    status: string = '';
    applicabledate: string = '';

    async onSubmit(f: NgForm) {
        if (f.invalid) {
            alert('退社予定日以外のすべての項目を入力して下さい');
            return;
        }
        const newEmployee = {
            name: this.name,
            employeeId: this.employeeId,
            birthdate: this.birthdate,
            joindate: this.joindate,
            resigndate: this.resigndate,
            employmenttype: this.employmenttype,
            hasSideJob: this.hasSideJob,
            sideJobEmploymenttype: this.hasSideJob ? this.sideJobEmploymenttype : '',
            estincome: this.estincome,
            sideJobEstincome: this.hasSideJob ? this.sideJobEstincome : null,
            dependents: this.dependents,
            status: this.status,
            applicabledate: this.applicabledate,
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

    onHasSideJobChange(): void {
        if (!this.hasSideJob) {
            this.sideJobEmploymenttype = '';
        }
    }

}