export interface Employee{
    name: string;
    employeeId: string;
    birthdate: Date;
    joindate: Date;
    resigndate?: Date;
    employmenttype: string;
    dependents: string;
    sidejob: string;
    sidejobincome: number | null;
    status: string;
    }