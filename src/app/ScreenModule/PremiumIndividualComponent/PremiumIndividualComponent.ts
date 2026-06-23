import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PremiumService } from '../../CoreModule/PremiumService';
import { CalculateIndividualInsuranceService } from '../../CoreModule/CalculateIndividualInsuranceService';

@Component({
    selector:'insurance-individual',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './PremiumIndividualComponent.html',
    styleUrls: ['./PremiumIndividualComponent.css']
})

export class PremiumIndividualComponent {

    healthInsurancePremiumIndividual: number = 0;
    healthInsuranceCompanyShare: number = 0;
    termCareInsurancePremiumIndividual: number = 0;
    termCareInsuranceCompanyShare: number = 0;
    socialInsurancePremiumIndividual: number = 0;
    socialInsuranceCompanyShare: number = 0;
    remarks: string = '';

    employeeId: string = '';
    yearMonth: string = '';
    isLoading = false;
    constructor(
        private premiumService: PremiumService,
        private calculateIndividualInsuranceService: CalculateIndividualInsuranceService,
        private changeDetectorRef: ChangeDetectorRef,
    ) {}

    async onReference() {
        if (this.isLoading) {
            return;
        }

        this.isLoading = true;
        this.changeDetectorRef.detectChanges();

        try {
            await this.premiumService.loadEmployeeStatusAtMonth(this.employeeId, this.yearMonth);
            await this.premiumService.loadAllPayments(this.employeeId, this.yearMonth);
            await this.calculateIndividualInsuranceService.calculate(this.yearMonth);
            this.healthInsurancePremiumIndividual =
                this.calculateIndividualInsuranceService.healthInsuranceHalf;
            this.healthInsuranceCompanyShare =
                this.calculateIndividualInsuranceService.healthInsuranceHalf;
            this.termCareInsurancePremiumIndividual =
                this.calculateIndividualInsuranceService.nursingInsuranceEmployeeShare;
            this.termCareInsuranceCompanyShare =
                this.calculateIndividualInsuranceService.nursingInsuranceCompanyShare;
            this.socialInsurancePremiumIndividual =
                this.calculateIndividualInsuranceService.welfarePensionHalf;
            this.socialInsuranceCompanyShare =
                this.calculateIndividualInsuranceService.welfarePensionHalf;
            this.remarks = this.calculateIndividualInsuranceService.remarks;
        } catch (error) {
            const message = error instanceof Error ? error.message : '照会に失敗しました';
            alert(message);
        } finally {
            this.isLoading = false;
            this.changeDetectorRef.detectChanges();
        }
    }
}