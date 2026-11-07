/**
 * SIARISA - Sistem Informasi Manajemen PKL dan PPDB Terintegrasi
 * Global TypeScript Type Definitions
 */

// ─── Role Constants ───────────────────────────────────────────────────────────

export const ROLES = {
    ADMIN: 'admin',
    HEADMASTER: 'headmaster',
    TEACHER: 'teacher',
    STUDENT: 'student',
    INDUSTRY_SUPERVISOR: 'industry_supervisor',
    APPLICANT: 'applicant',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// ─── Enums (mirroring PHP BackedEnums) ────────────────────────────────────────

export type PklApplicationStatus = 'submitted' | 'approved' | 'rejected';
export type AttendanceStatus = 'present' | 'permission' | 'sick' | 'absent';
export type JournalStatus = 'pending' | 'validated' | 'rejected';
export type PpdbApplicantStatus =
    | 'registered'
    | 'verified'
    | 'revision_needed'
    | 'accepted'
    | 'rejected'
    | 're_registered';
export type PpdbDocumentStatus = 'pending' | 'accepted' | 'rejected';

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
    path: string;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
}

// ─── Core Models ──────────────────────────────────────────────────────────────

export interface SiarisaUser {
    id: number;
    name: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    roles?: Role[];
    // Loaded relations
    student?: Student;
    teacher?: Teacher;
}

export interface AcademicYear {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Major {
    id: number;
    name: string;
    code: string;
    created_at: string;
    updated_at: string;
}

export interface Classroom {
    id: number;
    name: string;
    major_id: number;
    academic_year_id: number;
    created_at: string;
    updated_at: string;
    // Loaded relations
    major?: Major;
    academic_year?: AcademicYear;
}

export interface Teacher {
    id: number;
    user_id: number;
    nip: string | null;
    created_at: string;
    updated_at: string;
    // Loaded relations
    user?: SiarisaUser;
}

export interface Student {
    id: number;
    user_id: number;
    nis: string;
    nisn: string | null;
    classroom_id: number | null;
    major_id: number;
    ppdb_applicant_id: number | null;
    status: 'active' | 'inactive' | 'graduated';
    created_at: string;
    updated_at: string;
    // Loaded relations
    user?: SiarisaUser;
    classroom?: Classroom;
    major?: Major;
}

export interface Setting {
    id: number;
    key: string;
    value: string;
    created_at: string;
    updated_at: string;
}

// ─── PKL Models ───────────────────────────────────────────────────────────────

export interface Industry {
    id: number;
    name: string;
    address: string;
    phone: string | null;
    email: string | null;
    contact_person: string | null;
    created_at: string;
    updated_at: string;
}

export interface PklApplication {
    id: number;
    student_id: number;
    industry_id: number;
    academic_year_id: number;
    status: PklApplicationStatus;
    start_date: string | null;
    end_date: string | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
    // Loaded relations
    student?: Student;
    industry?: Industry;
    academic_year?: AcademicYear;
    supervisor?: PklSupervisor;
}

export interface PklSupervisor {
    id: number;
    pkl_application_id: number;
    teacher_id: number | null;
    industry_supervisor_user_id: number | null;
    created_at: string;
    updated_at: string;
    // Loaded relations
    teacher?: Teacher;
    industry_supervisor?: SiarisaUser;
}

export interface Journal {
    id: number;
    pkl_application_id: number;
    date: string;
    activity: string;
    status: JournalStatus;
    validated_at: string | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
}

export interface Attendance {
    id: number;
    pkl_application_id: number;
    date: string;
    status: AttendanceStatus;
    note: string | null;
    created_at: string;
    updated_at: string;
}

export interface PklGrade {
    id: number;
    pkl_application_id: number;
    industry_grade: number | null;
    teacher_grade: number | null;
    final_grade: number | null;
    created_at: string;
    updated_at: string;
}

// ─── Shared Inertia Page Props ─────────────────────────────────────────────────

export interface SiarisaSharedProps {
    auth: {
        user: SiarisaUser;
    };
    flash: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
    errors: Record<string, string>;
}

