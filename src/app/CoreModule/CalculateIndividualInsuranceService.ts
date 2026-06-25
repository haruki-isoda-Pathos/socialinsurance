import { Injectable } from '@angular/core';
import { PremiumService } from './PremiumService';
import { InsurancePayList } from './InsurancePayList';
import { InsuranceRateService } from './InsuranceRateService';
import { PremiumAdjustmentService } from './PremiumAdjustmentService';
import { InsurancePremiumsWithGrade } from '../ModelModule/InsurancePremiumsModel';
import { Payment } from '../ModelModule/PaymentModel';

@Injectable({ providedIn: 'root' })
export class CalculateIndividualInsuranceService {
    baseMonthlyReward = 0;
    baseMonthlyRewardMain = 0;
    baseMonthlyRewardSide = 0;

    healthGrade = 0;
    pensionGrade = 0;
    standardMonthlyReward = 0;
    pensionStandardReward = 0;

    healthInsurance = 0;
    healthInsuranceHalf = 0;
    nursingInsurance = 0;
    nursingInsuranceHalf = 0;
    welfarePension = 0;
    welfarePensionHalf = 0;

    revisionApplied = false;
    remarks = '';
    nursingInsuranceEmployeeShare = 0;
    nursingInsuranceCompanyShare = 0;

    constructor(
        private premiumService: PremiumService,
        private insurancePayList: InsurancePayList,
        private insuranceRateService: InsuranceRateService,
        private premiumAdjustmentService: PremiumAdjustmentService,
    ) {}

    async calculate(yearMonth: string): Promise<void> {
        this.revisionApplied = false;
        this.remarks = '';

        const employee = this.premiumService.employeeAtMonthEnd;
        if (!employee) {
            throw new Error('従業員情報が存在しません');
        }

        if (!employee.hasSideJob) {
            // ── ケース１：本業のみ ──────────────────────────────────────────
            this.baseMonthlyRewardMain = employee.estincome ?? 0;

            this.applyScheduledRevisionMain(yearMonth, employee.employmenttype);
            await this.applyAdHocRevisionMain(yearMonth, employee.employeeId);

            this.baseMonthlyReward = this.baseMonthlyRewardMain;

            const premiums = this.insurancePayList.calculateInsurancePremiumsWithGrade(
                this.baseMonthlyReward,
                yearMonth,
            );
            this.applyPremiums(premiums);
        } else {
            // ── ケース２：本業＋副業 ────────────────────────────────────────
            this.baseMonthlyRewardMain = employee.estincome ?? 0;
            this.baseMonthlyRewardSide = employee.sideJobEstincome ?? 0;

            this.applyScheduledRevisionMain(yearMonth, employee.employmenttype);
            await this.applyAdHocRevisionMain(yearMonth, employee.employeeId);

            this.applyScheduledRevisionSide(yearMonth, employee.sideJobEmploymenttype ?? '');
            await this.applyAdHocRevisionSide(yearMonth, employee.employeeId);

            this.baseMonthlyReward = this.baseMonthlyRewardMain + this.baseMonthlyRewardSide;

            const premiums = this.insurancePayList.calculateInsurancePremiumsWithGrade(
                this.baseMonthlyReward,
                yearMonth,
            );
            this.applyPremiums(premiums);
            this.applyMainJobProration();
        }

        this.applyBonusPremiums(yearMonth);
        this.applyPremiumAdjustments(yearMonth);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 賞与保険料（年3回以下賞与）
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * 年3回以下の賞与分保険料を算出し、既算の月例保険料に加算する。
     * ・1,000円未満切り捨て後ゼロになる場合はスキップ。
     * ・標準賞与額への置き換えは行わず、切り捨て後の額に料率を直接乗算。
     * ・端数処理：0.5以上切り上げ、0.5未満切り捨て。
     */
    private applyBonusPremiums(yearMonth: string): void {
        const employee = this.premiumService.employeeAtMonthEnd;
        if (!employee) return;

        const currentPayment = this.premiumService.allPayments[yearMonth];
        if (!currentPayment) return;

        const mainBonus = currentPayment.bonusPay ?? 0;
        const sideBonus = employee.hasSideJob ? (currentPayment.sideJobBonusPay ?? 0) : 0;
        const totalBonus = mainBonus + sideBonus;

        if (totalBonus === 0) return;

        // 1,000円未満切り捨て
        const bonusTruncated = Math.floor(totalBonus / 1000) * 1000;
        if (bonusTruncated === 0) return;

        const rates = this.insuranceRateService.getRatesForYearMonth(yearMonth);

        this.healthInsurance     += this.roundBonusPremium(bonusTruncated * rates.healthRate);
        this.healthInsuranceHalf += this.roundBonusPremium(bonusTruncated * rates.healthRate / 2);
        this.nursingInsurance     += this.roundBonusPremium(bonusTruncated * rates.nursingRate);
        this.nursingInsuranceHalf += this.roundBonusPremium(bonusTruncated * rates.nursingRate / 2);
        this.welfarePension       += this.roundBonusPremium(bonusTruncated * rates.pensionRate);
        this.welfarePensionHalf   += this.roundBonusPremium(bonusTruncated * rates.pensionRate / 2);
    }

    /** 0.5以上切り上げ、0.5未満切り捨て */
    private roundBonusPremium(value: number): number {
        const fraction = value - Math.floor(value);
        return fraction >= 0.5 ? Math.ceil(value) : Math.floor(value);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 定時改定（本業）
    // ─────────────────────────────────────────────────────────────────────────

    private applyScheduledRevisionMain(yearMonth: string, employmenttype: string): void {
        const aprJunMonths = this.premiumService.getAprJunYearMonths(yearMonth);
        const allPayments = this.premiumService.allPayments;

        const aprJunPayments = aprJunMonths
            .map((ym) => allPayments[ym])
            .filter((p): p is Payment => !!p);

        if (aprJunPayments.length === 0) {
            return;
        }

        const eligible = this.filterByAttendanceDays(aprJunPayments, employmenttype);
        if (eligible.length === 0) {
            return;
        }

        this.baseMonthlyRewardMain = this.average(eligible.map((p) => p.fixedPay + p.currentPay));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 定時改定（副業）
    // ─────────────────────────────────────────────────────────────────────────

    private applyScheduledRevisionSide(yearMonth: string, sideJobEmploymenttype: string): void {
        const aprJunMonths = this.premiumService.getAprJunYearMonths(yearMonth);
        const allPayments = this.premiumService.allPayments;

        const aprJunPayments = aprJunMonths
            .map((ym) => allPayments[ym])
            .filter((p): p is Payment => !!p && p.sidejobincome);

        if (aprJunPayments.length === 0) {
            return;
        }

        const eligible = this.filterByAttendanceDaysSide(aprJunPayments, sideJobEmploymenttype);
        if (eligible.length === 0) {
            return;
        }

        this.baseMonthlyRewardSide = this.average(
            eligible.map((p) => p.sideJobFixedPay + p.sideJobCurrentPay),
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 随時改定（本業）
    // ─────────────────────────────────────────────────────────────────────────

    private async applyAdHocRevisionMain(yearMonth: string, employeeId: string): Promise<void> {
        const pendingMonths = this.getPendingTriggerMonths(
            this.premiumService.allPayments,
            yearMonth,
            'mainJobTrigger',
        );

        for (const triggerYm of pendingMonths) {
            const revised = await this.tryAdHocRevisionMain(triggerYm, yearMonth, employeeId);
            if (revised !== null) {
                this.baseMonthlyRewardMain = revised;
                this.revisionApplied = true;
            }
        }
    }

    private async tryAdHocRevisionMain(
        triggerYearMonth: string,
        currentYearMonth: string,
        employeeId: string,
    ): Promise<number | null> {
        const allPayments = this.premiumService.allPayments;
        const followingMonths = this.premiumService.getFollowingMonths(triggerYearMonth, 2);
        const threeMonths = [triggerYearMonth, ...followingMonths];

        if (threeMonths[threeMonths.length - 1] > currentYearMonth) {
            return null;
        }

        const threePayments = threeMonths.map((ym) => allPayments[ym]);
        if (threePayments.some((p) => !p)) {
            return null;
        }

        const payments = threePayments as Payment[];

        if (payments.some((p) => p.networkDay < 17)) {
            await this.premiumService.updateTriggerStatus(
                employeeId,
                triggerYearMonth,
                'mainJobTrigger',
                'evaluated',
            );
            return null;
        }

        const mainAve = this.average(payments.map((p) => p.fixedPay + p.currentPay));
        const candidate = this.insurancePayList.calculateInsurancePremiumsWithGrade(
            mainAve,
            currentYearMonth,
        );
        const current = this.insurancePayList.calculateInsurancePremiumsWithGrade(
            this.baseMonthlyRewardMain,
            currentYearMonth,
        );

        const newReward = this.isGradeChangedByTwoOrMore(current, candidate) ? mainAve : null;

        await this.premiumService.updateTriggerStatus(
            employeeId,
            triggerYearMonth,
            'mainJobTrigger',
            'evaluated',
        );
        return newReward;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 随時改定（副業）
    // ─────────────────────────────────────────────────────────────────────────

    private async applyAdHocRevisionSide(yearMonth: string, employeeId: string): Promise<void> {
        const pendingMonths = this.getPendingTriggerMonths(
            this.premiumService.allPayments,
            yearMonth,
            'sideJobTrigger',
        );

        for (const triggerYm of pendingMonths) {
            const revised = await this.tryAdHocRevisionSide(triggerYm, yearMonth, employeeId);
            if (revised !== null) {
                this.baseMonthlyRewardSide = revised;
                this.revisionApplied = true;
            }
        }
    }

    private async tryAdHocRevisionSide(
        triggerYearMonth: string,
        currentYearMonth: string,
        employeeId: string,
    ): Promise<number | null> {
        const allPayments = this.premiumService.allPayments;
        const followingMonths = this.premiumService.getFollowingMonths(triggerYearMonth, 2);
        const threeMonths = [triggerYearMonth, ...followingMonths];

        if (threeMonths[threeMonths.length - 1] > currentYearMonth) {
            return null;
        }

        const threePayments = threeMonths.map((ym) => allPayments[ym]);
        if (threePayments.some((p) => !p)) {
            return null;
        }

        const payments = threePayments as Payment[];

        if (payments.some((p) => p.sideJobNetworkDay < 17)) {
            await this.premiumService.updateTriggerStatus(
                employeeId,
                triggerYearMonth,
                'sideJobTrigger',
                'evaluated',
            );
            return null;
        }

        const sideAve = this.average(
            payments.map((p) => p.sideJobFixedPay + p.sideJobCurrentPay),
        );
        const candidate = this.insurancePayList.calculateInsurancePremiumsWithGrade(
            sideAve,
            currentYearMonth,
        );
        const current = this.insurancePayList.calculateInsurancePremiumsWithGrade(
            this.baseMonthlyRewardSide,
            currentYearMonth,
        );

        const newReward = this.isGradeChangedByTwoOrMore(current, candidate) ? sideAve : null;

        await this.premiumService.updateTriggerStatus(
            employeeId,
            triggerYearMonth,
            'sideJobTrigger',
            'evaluated',
        );
        return newReward;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 共通ユーティリティ
    // ─────────────────────────────────────────────────────────────────────────

    /** pending トリガーのある月を古い順に返す（指定フィールド限定・照会月以前のみ） */
    private getPendingTriggerMonths(
        allPayments: Record<string, Payment>,
        yearMonth: string,
        field: 'mainJobTrigger' | 'sideJobTrigger',
    ): string[] {
        const result: string[] = [];
        for (const [ym, payment] of Object.entries(allPayments)) {
            if (ym > yearMonth) continue;
            if (payment[field] === 'pending') result.push(ym);
        }
        return result.sort((a, b) => a.localeCompare(b));
    }

    private isGradeChangedByTwoOrMore(
        base: InsurancePremiumsWithGrade,
        revised: InsurancePremiumsWithGrade,
    ): boolean {
        return (
            Math.abs(revised.healthGrade - base.healthGrade) >= 2 ||
            Math.abs(revised.pensionGrade - base.pensionGrade) >= 2
        );
    }

    /**
     * 雇用形態ごとの出勤日数フィルター（本業）。
     * 正社員でない要件充足者は「3か月とも17日未満なら15日以上で可」の救済措置を適用。
     */
    private filterByAttendanceDays(payments: Payment[], employmenttype: string): Payment[] {
        switch (employmenttype) {
            case 'permanent':
                return payments.filter((p) => p.networkDay >= 17);

            case 'temporary': {
                const allBelow17 = payments.every((p) => p.networkDay < 17);
                if (allBelow17) {
                    return payments.filter((p) => p.networkDay >= 15);
                }
                return payments.filter((p) => p.networkDay >= 17);
            }

            case 'short-term':
                return payments.filter((p) => p.networkDay >= 11);

            default:
                return payments.filter((p) => p.networkDay >= 17);
        }
    }

    /**
     * 雇用形態ごとの出勤日数フィルター（副業）。
     * 本業と同様のルールを sideJobNetworkDay で適用する。
     */
    private filterByAttendanceDaysSide(payments: Payment[], employmenttype: string): Payment[] {
        switch (employmenttype) {
            case 'permanent':
                return payments.filter((p) => p.sideJobNetworkDay >= 17);

            case 'temporary': {
                const allBelow17 = payments.every((p) => p.sideJobNetworkDay < 17);
                if (allBelow17) {
                    return payments.filter((p) => p.sideJobNetworkDay >= 15);
                }
                return payments.filter((p) => p.sideJobNetworkDay >= 17);
            }

            case 'short-term':
                return payments.filter((p) => p.sideJobNetworkDay >= 11);

            default:
                return payments.filter((p) => p.sideJobNetworkDay >= 17);
        }
    }

    /**
     * 本業報酬の割合で保険料を按分する（本業＋副業の場合のみ使用）。
     * 小数部 0.5 以下は切り捨て、0.5 超は切り上げ。
     */
    private applyMainJobProration(): void {
        const total = this.baseMonthlyReward;
        if (total === 0) return;

        const ratio = this.baseMonthlyRewardMain / total;
        this.healthInsurance = this.prorateValue(this.healthInsurance, ratio);
        this.healthInsuranceHalf = this.prorateValue(this.healthInsuranceHalf, ratio);
        this.nursingInsurance = this.prorateValue(this.nursingInsurance, ratio);
        this.nursingInsuranceHalf = this.prorateValue(this.nursingInsuranceHalf, ratio);
        this.welfarePension = this.prorateValue(this.welfarePension, ratio);
        this.welfarePensionHalf = this.prorateValue(this.welfarePensionHalf, ratio);
    }

    private prorateValue(value: number, ratio: number): number {
        const raw = value * ratio;
        const fraction = raw - Math.floor(raw);
        return fraction > 0.5 ? Math.ceil(raw) : Math.floor(raw);
    }

    private applyPremiums(premiums: InsurancePremiumsWithGrade): void {
        this.healthGrade = premiums.healthGrade;
        this.pensionGrade = premiums.pensionGrade;
        this.standardMonthlyReward = premiums.standardMonthlyReward;
        this.pensionStandardReward = premiums.pensionStandardReward;
        this.healthInsurance = premiums.healthInsurance;
        this.healthInsuranceHalf = premiums.healthInsuranceHalf;
        this.nursingInsurance = premiums.nursingInsurance;
        this.nursingInsuranceHalf = premiums.nursingInsuranceHalf;
        this.welfarePension = premiums.welfarePension;
        this.welfarePensionHalf = premiums.welfarePensionHalf;
    }

    private applyPremiumAdjustments(yearMonth: string): void {
        const employee = this.premiumService.employeeAtMonthEnd;
        if (!employee) {
            return;
        }

        const adjusted = this.premiumAdjustmentService.applyAdjustments(
            {
                healthInsurance: this.healthInsurance,
                healthInsuranceHalf: this.healthInsuranceHalf,
                nursingInsurance: this.nursingInsurance,
                nursingInsuranceHalf: this.nursingInsuranceHalf,
                welfarePension: this.welfarePension,
                welfarePensionHalf: this.welfarePensionHalf,
            },
            employee,
            yearMonth,
        );

        this.healthInsurance = adjusted.healthInsurance;
        this.healthInsuranceHalf = adjusted.healthInsuranceHalf;
        this.nursingInsurance = adjusted.nursingInsurance;
        this.nursingInsuranceHalf = adjusted.nursingInsuranceHalf;
        this.welfarePension = adjusted.welfarePension;
        this.welfarePensionHalf = adjusted.welfarePensionHalf;
        this.remarks = adjusted.remarks;
        this.nursingInsuranceEmployeeShare = adjusted.nursingInsuranceEmployeeShare;
        this.nursingInsuranceCompanyShare = adjusted.nursingInsuranceCompanyShare;
    }

    private average(values: number[]): number {
        if (values.length === 0) {
            return 0;
        }
        return values.reduce((sum, v) => sum + v, 0) / values.length;
    }
}
