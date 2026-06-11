import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { PaymentService } from '../../../CoreModule/PaymentService';
import { Payment } from '../../../ModelModule/PaymentModel';
import { Employee } from '../../../ModelModule/EmployeeModel';

@Component({
    selector: 'app-modal-payment',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './PaymentRegisterModalComponent.html',
    styleUrls:['./PaymentRegisterModalComponent.css']
})

export class PaymentRegisterModalComponent {

    @Input() employee!: Employee;
    @Output() closePaymentModal = new EventEmitter<void>();
    payment: Payment = {
        employeeId: '',
        yearMonth: '',
        basicPay: 0,
        basicOvertimePay: 0,
        networkDay: 0,
        incentivePay: 0,
        mobilityAllowance: 0,
        specialAllowance: 0,
        bonus: 0,
    }

    private paymentService = inject(PaymentService) 

    async onSubmit(f: NgForm) {
        if (f.invalid) {
            alert('すべての項目を入力して下さい');
            return;
        }
        const payment = {
            employeeId: this.employee.employeeId,
            yearMonth: this.payment.yearMonth,
            basicPay: this.payment.basicPay,
            basicOvertimePay: this.payment.basicOvertimePay,
            networkDay: this.payment.networkDay,
            incentivePay: this.payment.incentivePay,
            mobilityAllowance: this.payment.mobilityAllowance,
            specialAllowance: this.payment.specialAllowance,
            bonus: this.payment.bonus,
        };
        try {
            await this.paymentService.registerPayment(payment);
            this.closePaymentModal.emit();
        } catch {
            alert('給与等の登録に失敗しました。');
        }
    }

    onClose(){
        this.closePaymentModal.emit();
    }
}

