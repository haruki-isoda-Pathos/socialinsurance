export type TriggerStatus = 'pending' | 'evaluated';

export interface Payment {
    employeeId: string;
    yearMonth: string;
    networkDay: number;
    fixedPay: number;
    currentPay: number;
    sidejobincome: boolean;
    sideJobNetworkDay: number;
    sideJobFixedPay: number;
    sideJobCurrentPay: number;
    /** 年3回以下賞与の当月支給額（本業） */
    bonusPay?: number;
    /** 年3回以下賞与の当月支給額（副業） */
    sideJobBonusPay?: number;
    /** 本業の固定的給与が前月から変わった場合に付与されるトリガー */
    mainJobTrigger?: TriggerStatus;
    /** 副業の固定的給与が前月から変わった場合に付与されるトリガー */
    sideJobTrigger?: TriggerStatus;
}