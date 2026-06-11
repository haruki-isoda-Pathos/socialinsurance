export interface Employee{
    name: string;
    employeeId: string;
    birthdate: string;
    joindate: string;
    resigndate?: string;
    employmenttype: string;
    dependents: string;
    sidejob: string;
    sidejobincome: number | null;
    status: string;
    }