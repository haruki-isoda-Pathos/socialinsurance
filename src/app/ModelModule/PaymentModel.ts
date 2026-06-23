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
    /** 本業の固定的給与が前月から変わった場合に付与されるトリガー */
    mainJobTrigger?: TriggerStatus;
    /** 副業の固定的給与が前月から変わった場合に付与されるトリガー */
    sideJobTrigger?: TriggerStatus;
}