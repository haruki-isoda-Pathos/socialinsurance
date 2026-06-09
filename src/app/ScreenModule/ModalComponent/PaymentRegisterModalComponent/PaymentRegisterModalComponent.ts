import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../CoreModule/PaymentService';
import { Payment } from '../../../ModelModule/PaymentModel';

@Component({
    selector: 'app-modal-payment',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './PremiumRegisterModalComponent.html',
    styleUrls:['./PremiumRegisterModalComponent.css']
})

export class PremiumRegisterModalComponent {

    @Input() isOpen = false;
    @Input() employee = '';
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

    onSubmit() {
        const payment = {
            employeeId: this.employee,
            yearMonth: this.payment.yearMonth,
            basicPay: this.payment.basicPay,
            basicOvertimePay: this.payment.basicOvertimePay,
            networkDay: this.payment.networkDay,
            incentivePay: this.payment.incentivePay,
            mobilityAllowance: this.payment.mobilityAllowance,
            specialAllowance: this.payment.specialAllowance,
            bonus: this.payment.bonus,
        } as Payment;
        this.paymentService.registerPayment(payment) 
    }

    onClose(){
        this.closePaymentModal.emit();
    }
}

