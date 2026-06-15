import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PremiumService } from '../../CoreModule/PremiumService';

@Component({
    selector:'insurance-individual',
    standalone: true,
    imports: [FormsModule],
    templateUrl: './PremiumIndividualComponent.html',
    styleUrls: ['./PremiumIndividualComponent.css']
})

export class PremiumIndividualComponent {
    employeeId: string = '';
    yearMonth: string = '';
    constructor(private premiumService: PremiumService){}

    async onReference() {
        await this.premiumService.getStandardMonthlyRemun(this.employeeId, this.yearMonth);
        //これまず、onReferenceで得た従業員とyearMonthの情報をサービスに送らないといかんよね。
        //計算結果が出てくるのでそれを補完で出す、という。
    }
}