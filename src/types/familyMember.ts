import { Tenant } from "./tenant";

export interface FamilyMember {
    id: number;
    name: string;
    surname: string;
    relationship: string;
    mobile: string;

    tenant?: Tenant;
}