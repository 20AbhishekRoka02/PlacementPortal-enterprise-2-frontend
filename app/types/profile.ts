export interface BaseProfile {
    id: number;
    email: string;
    role: string;
    is_staff: boolean;
}

export interface StudentProfile extends BaseProfile {
    role: "student",
    first_name: string;
    last_name: string;
    batch: string;
};

export interface StaffProfile extends BaseProfile {
    role: "placement_officer" | "hod" | "admin";
};

export type Profile = StudentProfile | StaffProfile;
