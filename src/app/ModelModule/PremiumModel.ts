export interface MainJobPaymentRecord {
    networkDay: number | null;
    fixedPay: number | null;
    currentPay: number | null;
}

export interface SideJobPaymentRecord {
    sideJobNetworkDay: number | null;
    sideJobFixedPay: number | null;
    sideJobCurrentPay: number | null;
}
