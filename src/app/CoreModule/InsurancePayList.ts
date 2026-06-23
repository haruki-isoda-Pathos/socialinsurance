import { Injectable } from '@angular/core';
import { InsurancePremiumsWithGrade } from '../ModelModule/InsurancePremiumsModel';
import { InsuranceRateService } from './InsuranceRateService';

@Injectable({ providedIn: 'root' })
export class InsurancePayList {
    constructor(private insuranceRateService: InsuranceRateService) {}
    /**
     * 令和8年度 東京都 協会けんぽ・厚生年金保険料 計算（等級インデックス付き）
     * @param monthlyReward 報酬月額（実際の総支給額）
     */
    calculateInsurancePremiumsWithGrade(
        monthlyReward: number,
        yearMonth: string,
    ): InsurancePremiumsWithGrade {
        let healthGrade = 1;
        let hReward = 58000;

        if (monthlyReward < 63000) {
            healthGrade = 1;
            hReward = 58000;
        } else if (monthlyReward < 73000) {
            healthGrade = 2;
            hReward = 68000;
        } else if (monthlyReward < 83000) {
            healthGrade = 3;
            hReward = 78000;
        } else if (monthlyReward < 93000) {
            healthGrade = 4;
            hReward = 88000;
        } else if (monthlyReward < 101000) {
            healthGrade = 5;
            hReward = 98000;
        } else if (monthlyReward < 107000) {
            healthGrade = 6;
            hReward = 104000;
        } else if (monthlyReward < 114000) {
            healthGrade = 7;
            hReward = 110000;
        } else if (monthlyReward < 122000) {
            healthGrade = 8;
            hReward = 118000;
        } else if (monthlyReward < 130000) {
            healthGrade = 9;
            hReward = 126000;
        } else if (monthlyReward < 138000) {
            healthGrade = 10;
            hReward = 134000;
        } else if (monthlyReward < 146000) {
            healthGrade = 11;
            hReward = 142000;
        } else if (monthlyReward < 155000) {
            healthGrade = 12;
            hReward = 150000;
        } else if (monthlyReward < 165000) {
            healthGrade = 13;
            hReward = 160000;
        } else if (monthlyReward < 175000) {
            healthGrade = 14;
            hReward = 170000;
        } else if (monthlyReward < 185000) {
            healthGrade = 15;
            hReward = 180000;
        } else if (monthlyReward < 195000) {
            healthGrade = 16;
            hReward = 190000;
        } else if (monthlyReward < 210000) {
            healthGrade = 17;
            hReward = 200000;
        } else if (monthlyReward < 230000) {
            healthGrade = 18;
            hReward = 220000;
        } else if (monthlyReward < 250000) {
            healthGrade = 19;
            hReward = 240000;
        } else if (monthlyReward < 270000) {
            healthGrade = 20;
            hReward = 260000;
        } else if (monthlyReward < 290000) {
            healthGrade = 21;
            hReward = 280000;
        } else if (monthlyReward < 310000) {
            healthGrade = 22;
            hReward = 300000;
        } else if (monthlyReward < 330000) {
            healthGrade = 23;
            hReward = 320000;
        } else if (monthlyReward < 350000) {
            healthGrade = 24;
            hReward = 340000;
        } else if (monthlyReward < 370000) {
            healthGrade = 25;
            hReward = 360000;
        } else if (monthlyReward < 395000) {
            healthGrade = 26;
            hReward = 380000;
        } else if (monthlyReward < 425000) {
            healthGrade = 27;
            hReward = 410000;
        } else if (monthlyReward < 455000) {
            healthGrade = 28;
            hReward = 440000;
        } else if (monthlyReward < 485000) {
            healthGrade = 29;
            hReward = 470000;
        } else if (monthlyReward < 515000) {
            healthGrade = 30;
            hReward = 500000;
        } else if (monthlyReward < 545000) {
            healthGrade = 31;
            hReward = 530000;
        } else if (monthlyReward < 575000) {
            healthGrade = 32;
            hReward = 560000;
        } else if (monthlyReward < 605000) {
            healthGrade = 33;
            hReward = 590000;
        } else if (monthlyReward < 635000) {
            healthGrade = 34;
            hReward = 620000;
        } else if (monthlyReward < 665000) {
            healthGrade = 35;
            hReward = 650000;
        } else if (monthlyReward < 695000) {
            healthGrade = 36;
            hReward = 680000;
        } else if (monthlyReward < 730000) {
            healthGrade = 37;
            hReward = 710000;
        } else if (monthlyReward < 770000) {
            healthGrade = 38;
            hReward = 750000;
        } else if (monthlyReward < 810000) {
            healthGrade = 39;
            hReward = 790000;
        } else if (monthlyReward < 855000) {
            healthGrade = 40;
            hReward = 830000;
        } else if (monthlyReward < 905000) {
            healthGrade = 41;
            hReward = 880000;
        } else if (monthlyReward < 955000) {
            healthGrade = 42;
            hReward = 930000;
        } else if (monthlyReward < 1005000) {
            healthGrade = 43;
            hReward = 980000;
        } else if (monthlyReward < 1055000) {
            healthGrade = 44;
            hReward = 1030000;
        } else if (monthlyReward < 1115000) {
            healthGrade = 45;
            hReward = 1090000;
        } else if (monthlyReward < 1175000) {
            healthGrade = 46;
            hReward = 1150000;
        } else if (monthlyReward < 1235000) {
            healthGrade = 47;
            hReward = 1210000;
        } else if (monthlyReward < 1295000) {
            healthGrade = 48;
            hReward = 1260000;
        } else if (monthlyReward < 1355000) {
            healthGrade = 49;
            hReward = 1330000;
        } else {
            healthGrade = 50;
            hReward = 1390000;
        }

        let pensionGrade = 1;
        let pReward = 88000;

        if (healthGrade <= 4) {
            pensionGrade = 1;
            pReward = 88000;
        } else if (healthGrade >= 35) {
            pensionGrade = 32;
            pReward = 650000;
        } else {
            pensionGrade = healthGrade - 3;
            pReward = hReward;
        }

        const healthInsurance = Math.round(hReward * this.insuranceRateService.getHealthRate(yearMonth));
        const nursingInsurance = Math.round(hReward * this.insuranceRateService.getNursingRate(yearMonth));
        const welfarePension = Math.round(pReward * this.insuranceRateService.getPensionRate(yearMonth));
        // #region agent log
        fetch('http://127.0.0.1:7877/ingest/e924b3ce-ea66-46ab-93b9-b99a79ae1438',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'b88198'},body:JSON.stringify({sessionId:'b88198',location:'InsurancePayList.ts:calculateInsurancePremiumsWithGrade',message:'premiums calculated with rates',data:{yearMonth,monthlyReward,hReward,healthRate:this.insuranceRateService.getHealthRate(yearMonth),healthInsurance},timestamp:Date.now(),hypothesisId:'E'})}).catch(()=>{});
        // #endregion

        const healthInsuranceHalf = Math.round(healthInsurance / 2);
        const nursingInsuranceHalf = Math.round(nursingInsurance / 2);
        const welfarePensionHalf = Math.round(welfarePension / 2);

        return {
            healthGrade,
            pensionGrade,
            standardMonthlyReward: hReward,
            pensionStandardReward: pReward,
            healthInsurance,
            healthInsuranceHalf,
            nursingInsurance,
            nursingInsuranceHalf,
            welfarePension,
            welfarePensionHalf,
        };
    }
}
