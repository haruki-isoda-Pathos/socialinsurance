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
        networkDay: 0,
        fixedPay: 0,
        currentPay: 0,
        sidejobincome: false,
        sideJobNetworkDay: 0,
        sideJobFixedPay: 0,
        sideJobCurrentPay: 0,
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
            fixedPay: this.payment.fixedPay,
            currentPay: this.payment.currentPay,
            networkDay: this.payment.networkDay,
            sidejobincome: this.payment.sidejobincome,
            sideJobNetworkDay: this.payment.sideJobNetworkDay,
            sideJobFixedPay: this.payment.sideJobFixedPay,
            sideJobCurrentPay: this.payment.sideJobCurrentPay,
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

