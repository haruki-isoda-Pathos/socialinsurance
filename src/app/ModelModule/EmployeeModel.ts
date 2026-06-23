export interface Employee{
    name: string;
    employeeId: string;
    birthdate: string;
    joindate: string;
    resigndate?: string;
    employmenttype: string;
    hasSideJob: boolean;
    sideJobEmploymenttype?: string;
    estincome: number | null;
    sideJobEstincome: number | null;
    dependents: string;
    status: string;
    applicabledate: string;
    }