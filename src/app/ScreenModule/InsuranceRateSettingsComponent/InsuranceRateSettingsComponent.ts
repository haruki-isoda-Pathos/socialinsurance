import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InsuranceRateService } from '../../CoreModule/InsuranceRateService';

@Component({
    selector: 'insurance-rate-settings',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './InsuranceRateSettingsComponent.html',
    styleUrls: ['./InsuranceRateSettingsComponent.css'],
})
export class InsuranceRateSettingsComponent implements OnInit {
    healthPercent = 9.85;
    nursingPercent = 1.62;
    pensionPercent = 18.3;
    effectiveYearMonth = '';
    savedMessage = '';

    constructor(private insuranceRateService: InsuranceRateService) {}

    ngOnInit(): void {
        this.effectiveYearMonth = this.getCurrentYearMonth();
        this.loadCurrentRates();
    }

    onSave(): void {
        if (!this.effectiveYearMonth) {
            alert('適用開始年月を指定してください。');
            return;
        }

        if (!this.isValidInput()) {
            alert('料率は0以上の数値で入力してください。');
            return;
        }

        this.insuranceRateService.saveRatesFromPercent(
            this.healthPercent,
            this.nursingPercent,
            this.pensionPercent,
            this.effectiveYearMonth,
        );
        this.savedMessage = `${this.effectiveYearMonth} から適用する保険料率を保存しました。`;
    }

    onReset(): void {
        this.insuranceRateService.resetToDefaults();
        this.effectiveYearMonth = this.getCurrentYearMonth();
        this.loadCurrentRates();
        this.savedMessage = '保存済みの料率設定を削除し、デフォルトの保険料率に戻しました。';
    }

    onEffectiveYearMonthChange(): void {
        this.loadCurrentRates();
    }

    private loadCurrentRates(): void {
        const rates = this.insuranceRateService.getRatesAsPercent(this.effectiveYearMonth);
        this.healthPercent = rates.healthPercent;
        this.nursingPercent = rates.nursingPercent;
        this.pensionPercent = rates.pensionPercent;
    }

    private isValidInput(): boolean {
        return [this.healthPercent, this.nursingPercent, this.pensionPercent].every(
            (value) => typeof value === 'number' && !Number.isNaN(value) && value >= 0,
        );
    }

    private getCurrentYearMonth(): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }
}
