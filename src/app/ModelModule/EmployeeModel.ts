export interface Employee{
    name: string;
    employeeId: string;
    birthdate: string;
    joindate: string;
    resigndate?: string;
    employmenttype: string;
    estincome: number | null;
    dependents: string;
    status: string;
    applicabledate: string;
    }