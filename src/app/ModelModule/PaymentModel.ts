export interface Payment {
    employeeId: string;
    yearMonth: string;
    basicPay: number;
    basicOvertimePay: number;
    networkDay: number;
    incentivePay: number;
    mobilityAllowance: number;
    specialAllowance: number;
    bonus: number;
}