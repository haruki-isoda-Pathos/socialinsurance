//システム利用者モデルつまりアプリにログインできる人
export interface User{
    uid:string;
    name:string;
    employeeId:string;
    role:'employee'|'admin';
    createdAt?:any;
}