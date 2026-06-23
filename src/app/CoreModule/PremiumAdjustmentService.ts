import { Injectable } from '@angular/core';
import { Employee } from '../ModelModule/EmployeeModel';

export interface PremiumAmounts {
    healthInsurance: number;
    healthInsuranceHalf: number;
    nursingInsurance: number;
    nursingInsuranceHalf: number;
    welfarePension: number;
    welfarePensionHalf: number;
}

export interface PremiumAdjustmentResult extends PremiumAmounts {
    remarks: string;
    nursingInsuranceEmployeeShare: number;
    nursingInsuranceCompanyShare: number;
}

@Injectable({ providedIn: 'root' })
export class PremiumAdjustmentService {
    /**
     * 定時改定・随時改定・税率適用後の保険料に、
     * ステータス・退職日・扶養・年齢・雇用形態に基づく調整を適用する。
     */
    applyAdjustments(
        premiums: PremiumAmounts,
        employee: Employee,
        yearMonth: string,
    ): PremiumAdjustmentResult {
        const adjusted: PremiumAmounts = { ...premiums };
        const remarkParts: string[] = [];
        let nursingEmployeeShare = adjusted.nursingInsuranceHalf;
        let nursingCompanyShare = adjusted.nursingInsuranceHalf;

        this.applyStatusAdjustments(adjusted, employee);
        this.applyResignationAdjustments(adjusted, employee, yearMonth, remarkParts);
        this.applyDependentAdjustments(adjusted, employee.dependents);
        this.applyAgeAdjustments(
            adjusted,
            employee.birthdate,
            yearMonth,
            remarkParts,
            (employeeShare, companyShare) => {
                nursingEmployeeShare = employeeShare;
                nursingCompanyShare = companyShare;
            },
        );
        this.applyEmploymentTypeAdjustments(adjusted, employee.employmenttype, remarkParts);

        if (adjusted.nursingInsurance === 0) {
            nursingEmployeeShare = 0;
            nursingCompanyShare = 0;
        }

        return {
            ...adjusted,
            remarks: remarkParts.join(' / '),
            nursingInsuranceEmployeeShare: nursingEmployeeShare,
            nursingInsuranceCompanyShare: nursingCompanyShare,
        };
    }

    /** １．従業員ステータスに基づく調整 */
    private applyStatusAdjustments(adjusted: PremiumAmounts, employee: Employee): void {
        switch (employee.status) {
            case 'b-join':
                this.zeroAllInsurances(adjusted);
                break;
            case 'active2':
                this.zeroPension(adjusted);
                break;
            case 'inactive1':
            case 'inactive2':
            case 'inactive3':
                this.zeroAllInsurances(adjusted);
                break;
        }
    }

    /**
     * 退職日の判定に使う日付を返す。
     * ステータスが退職の場合は applicabledate、それ以外は resigndate を使用する。
     */
    getEffectiveResignDate(employee: Employee): string | null {
        if (employee.status === 'resigned' && employee.applicabledate) {
            return employee.applicabledate;
        }
        if (employee.resigndate) {
            return employee.resigndate;
        }
        return null;
    }

    /**
     * 照会月の支給実績が未登録でも照会を許可するか。
     * 退職月（月中退職・同月同喪以外）および退職月以降は許可する。
     */
    shouldAllowMissingPayment(employee: Employee, yearMonth: string): boolean {
        const resignDate = this.getEffectiveResignDate(employee);
        if (!resignDate) {
            return false;
        }

        const resignYm = this.toYearMonth(resignDate);
        if (yearMonth > resignYm) {
            return true;
        }

        if (yearMonth === resignYm) {
            const isMidMonth = !this.isMonthEnd(resignDate);
            const isSameMonthJoinResign =
                resignYm === this.toYearMonth(employee.joindate);
            return isMidMonth && !isSameMonthJoinResign;
        }

        return false;
    }

    /** 退職日に基づく保険料調整（①②③④） */
    private applyResignationAdjustments(
        adjusted: PremiumAmounts,
        employee: Employee,
        yearMonth: string,
        remarkParts: string[],
    ): void {
        const resignDate = this.getEffectiveResignDate(employee);
        if (!resignDate) {
            return;
        }

        const resignYm = this.toYearMonth(resignDate);
        const joinYm = this.toYearMonth(employee.joindate);
        const isMidMonth = !this.isMonthEnd(resignDate);
        const isSameMonthJoinResign = resignYm === joinYm;

        if (yearMonth > resignYm) {
            this.zeroAllInsurances(adjusted);
            return;
        }

        if (yearMonth < resignYm) {
            return;
        }

        // yearMonth === resignYm（退職月）
        if (isMidMonth && isSameMonthJoinResign) {
            remarkParts.push('同月同喪・還付可能性あり');
            return;
        }

        if (isMidMonth && !isSameMonthJoinResign) {
            this.zeroAllInsurances(adjusted);
        }
    }

    /** ２．被扶養（第三号被保険者）による全額免除 */
    private applyDependentAdjustments(adjusted: PremiumAmounts, dependents: string): void {
        if (dependents === 'yes') {
            this.zeroAllInsurances(adjusted);
        }
    }

    /** ３．年齢に基づく調整 */
    private applyAgeAdjustments(
        adjusted: PremiumAmounts,
        birthdate: string,
        yearMonth: string,
        remarkParts: string[],
        setNursingShares: (employeeShare: number, companyShare: number) => void,
    ): void {
        if (!birthdate) {
            return;
        }

        const before40Month = this.getMilestoneMonth(birthdate, 40, true);
        if (yearMonth < before40Month) {
            this.zeroNursing(adjusted);
            setNursingShares(0, 0);
            return;
        }

        const from65Month = this.getMilestoneMonth(birthdate, 65, true);
        if (yearMonth >= from65Month) {
            adjusted.nursingInsuranceHalf = 0;
            setNursingShares(adjusted.nursingInsurance, 0);
        }

        const from70Month = this.getMilestoneMonth(birthdate, 70, true);
        if (yearMonth >= from70Month) {
            remarkParts.push('任意継続選択時の保険料※本来厚生年金保険料は負担なし');
        }

        const from75Month = this.getMilestoneMonth(birthdate, 75, false);
        if (yearMonth >= from75Month) {
            this.zeroHealth(adjusted);
        }
    }

    /** ４．雇用形態に基づく調整 */
    private applyEmploymentTypeAdjustments(
        adjusted: PremiumAmounts,
        employmenttype: string,
        remarkParts: string[],
    ): void {
        if (employmenttype === 'short-term-2' || employmenttype === 'other') {
            this.zeroAllInsurances(adjusted);
            remarkParts.push('国保を自己負担');
        }
    }

    /** 誕生日から到達年齢の基準月（YYYY-MM）を返す */
    getMilestoneMonth(birthdate: string, age: number, useDayBefore: boolean): string {
        const [birthYear, birthMonth, birthDay] = birthdate.split('-').map(Number);
        const milestone = new Date(birthYear + age, birthMonth - 1, birthDay);

        if (useDayBefore) {
            milestone.setDate(milestone.getDate() - 1);
        }

        const year = milestone.getFullYear();
        const month = String(milestone.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    }

    isMonthEnd(dateStr: string): boolean {
        const [year, month, day] = dateStr.split('-').map(Number);
        const lastDay = new Date(year, month, 0).getDate();
        return day === lastDay;
    }

    private toYearMonth(dateStr: string): string {
        return dateStr.slice(0, 7);
    }

    private zeroAllInsurances(adjusted: PremiumAmounts): void {
        adjusted.healthInsurance = 0;
        adjusted.healthInsuranceHalf = 0;
        adjusted.nursingInsurance = 0;
        adjusted.nursingInsuranceHalf = 0;
        adjusted.welfarePension = 0;
        adjusted.welfarePensionHalf = 0;
    }

    private zeroHealth(adjusted: PremiumAmounts): void {
        adjusted.healthInsurance = 0;
        adjusted.healthInsuranceHalf = 0;
    }

    private zeroNursing(adjusted: PremiumAmounts): void {
        adjusted.nursingInsurance = 0;
        adjusted.nursingInsuranceHalf = 0;
    }

    private zeroPension(adjusted: PremiumAmounts): void {
        adjusted.welfarePension = 0;
        adjusted.welfarePensionHalf = 0;
    }
}
