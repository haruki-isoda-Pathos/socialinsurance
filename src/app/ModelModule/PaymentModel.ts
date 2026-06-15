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
}