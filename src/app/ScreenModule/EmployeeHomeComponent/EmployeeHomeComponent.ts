import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../../CoreModule/EmployeeService';
import { Employee } from '../../ModelModule/EmployeeModel'

@Component({
    selector: 'app-employee-home',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './EmployeeHomeComponent.html',
    styleUrls:['./EmployeeHomeComponent.css']
})

export class EmployeeHomeComponent{

  employeeService = inject(EmployeeService);
  isModalOpen = false;
  isEditModalOpen = false;
  isPaymentModalOpen = false;
  employees: Employee[] = [];

  

  async onRegisterEmployee() {
    this.isModalOpen = true;
  }
  async onCloseModal() {
    this.isModalOpen = false;
  }

  async onEditEmployee() {
    this.isEditModalOpen = true;
  }
  async onCloseEditModal() {
    this.isEditModalOpen = false;
  }

  async onOpenPaymentModal() {
    this.isPaymentModalOpen = true;
  }
  async onClosePaymentModal() {
    this.isPaymentModalOpen = false;
  }

  
  async onDeleteEmployee(employee: Employee){
    this.employeeService.deleteEmployee(employee.employeeId)
  }

  async ngOnInit() {
    this.employees = await this.employeeService.getEmployees()  
  }
 
}