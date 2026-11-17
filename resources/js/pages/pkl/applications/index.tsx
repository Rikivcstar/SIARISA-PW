import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    faArrowRight,
    faBuilding,
    faCalendarDays,
    faChalkboardUser,
    faCheck,
    faCheckCircle,
    faCircleCheck,
    faCircleExclamation,
    faCircleXmark,
    faClock,
    faFilter,
    faGraduationCap,
    faIdCard,
    faLocationDot,
    faMagnifyingGlass,
    faPaperPlane,
    faPenToSquare,
    faPhone,
    faPlus,
    faRotateRight,
    faTrash,
    faUser,
    faUserCheck,
    faUserGear,
    faUserGraduate,
    faUsers,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSiarisaAlert } from '@/components/siarisa-alert';
import { formatDateIndo } from '@/lib/utils';

interface UserData {
    id: number;
    name: string;
    email: string;
}

interface MajorData {
    id: number;
    name: string;
    code: string;
}

interface ClassroomData {
    id: number;
    name: string;
}

interface StudentData {
    id: number;
    nis: string;
    phone: string | null;
    user: UserData;
    major?: MajorData;
    classroom?: ClassroomData;
}

interface IndustryData {
    id: number;
    name: string;
    address: string;
    city: string | null;
    phone: string | null;
    email: string | null;
    contact_person: string | null;
    contact_phone: string | null;
}

interface TeacherData {
    id: number;
    nip: string | null;
    phone: string | null;
    user: UserData;
}

interface IndustrySupervisorData {
    id: number;
    position: string | null;
    phone: string | null;
    user: UserData;
    industry?: { id: number; name: string };
}

interface PklSupervisorData {
    id: number;
    teacher_id: number | null;
    industry_supervisor_id: number | null;
    teacher?: TeacherData;
    industry_supervisor?: IndustrySupervisorData;
}

interface AcademicYearData {
    id: number;
    name: string;
}

interface PklApplicationItem {
    id: number;
    student_id: number;
    industry_id: number;
    academic_year_id: number;
    status: 'submitted' | 'approved' | 'rejected';
    start_date: string | null;
    end_date: string | null;
    rejection_reason: string | null;
    student: StudentData;
    industry: IndustryData;
    academic_year?: AcademicYearData;
    supervisor?: PklSupervisorData;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedApplications {
    data: PklApplicationItem[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface KpiStats {
    total: number;
    submitted: number;
    approved: number;
    rejected: number;
    no_supervisor: number;
}

interface Props {
    isStudent: boolean;
    // Siswa props
    student?: StudentData;
    myApplication?: PklApplicationItem | null;
    availableIndustries?: IndustryData[];
    // Admin props
    applications?: PaginatedApplications;
    kpi?: KpiStats;
    majors?: MajorData[];
    industries?: IndustryData[];
    teachers?: TeacherData[];
    industrySupervisors?: IndustrySupervisorData[];
    activeYear?: AcademicYearData | null;
    filters?: {
        search: string;
        status: string;
        major_id: string | number;
        industry_id: string | number;
    };
}

export default function PklApplicationsIndex({
    isStudent,
    student,
    myApplication,
    availableIndustries = [],
    applications,
    kpi,
    majors = [],
    industries = [],
    teachers = [],
    industrySupervisors = [],
    activeYear,
    filters = { search: '', status: '', major_id: '', industry_id: '' },
}: Props) {
    const alert = useSiarisaAlert();
    const { auth } = usePage().props as { auth: { user: { roles?: string[] } } };
    const isAdmin = auth.user.roles?.includes('admin') || auth.user.roles?.includes('headmaster');

    // ─────────────────────────────────────────────────────────────
    // PORTAL SISWA: STATE & FORM
    // ─────────────────────────────────────────────────────────────
    const [isReapplying, setIsReapplying] = useState(false);
    const studentForm = useForm({
        industry_id: myApplication?.industry_id ? String(myApplication.industry_id) : '',
        start_date: myApplication?.start_date || '2026-08-01',
        end_date: myApplication?.end_date || '2026-11-30',
    });

    const handleStudentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        studentForm.post('/pkl/applications', {
            onSuccess: () => {
                setIsReapplying(false);
            },
        });
    };

    const handleCancelApplication = (appId: number) => {
        alert.deleteConfirm(
            'Batalkan Pengajuan PKL?',
            'Apakah Anda yakin ingin membatalkan pengajuan tempat PKL ini?',
            () => {
                router.delete(`/pkl/applications/${appId}`);
            }
        );
    };

    // ─────────────────────────────────────────────────────────────
    // ADMIN / KOORDINATOR: MODALS & FORMS
    // ─────────────────────────────────────────────────────────────
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedMajor, setSelectedMajor] = useState(String(filters.major_id || ''));
    const [selectedIndustry, setSelectedIndustry] = useState(String(filters.industry_id || ''));

    // Modal Verifikasi (Approve/Reject)
    const [verifyingApp, setVerifyingApp] = useState<PklApplicationItem | null>(null);
    const verifyForm = useForm({
        status: 'approved' as 'approved' | 'rejected',
        rejection_reason: '',
        start_date: '',
        end_date: '',
    });

    const openVerifyModal = (app: PklApplicationItem) => {
        setVerifyingApp(app);
        verifyForm.clearErrors();
        verifyForm.setData({
            status: 'approved',
            rejection_reason: '',
            start_date: app.start_date || '2026-08-01',
            end_date: app.end_date || '2026-11-30',
        });
    };

    const handleVerifySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!verifyingApp) return;

        verifyForm.put(`/pkl/applications/${verifyingApp.id}/verify`, {
            onSuccess: () => {
                setVerifyingApp(null);
            },
        });
    };

    // Modal Penetapan Pembimbing (Assign Supervisors)
    const [assigningApp, setAssigningApp] = useState<PklApplicationItem | null>(null);
    const assignForm = useForm({
        teacher_id: '',
        industry_supervisor_id: '',
    });

    const openAssignModal = (app: PklApplicationItem) => {
        setAssigningApp(app);
        assignForm.clearErrors();
        assignForm.setData({
            teacher_id: app.supervisor?.teacher_id ? String(app.supervisor.teacher_id) : '',
            industry_supervisor_id: app.supervisor?.industry_supervisor_id ? String(app.supervisor.industry_supervisor_id) : '',
        });
    };

    const handleAssignSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!assigningApp) return;

        assignForm.put(`/pkl/applications/${assigningApp.id}/assign-supervisors`, {
            onSuccess: () => {
                setAssigningApp(null);
            },
        });
    };

    const handleAdminDelete = (app: PklApplicationItem) => {
        alert.deleteConfirm(
            'Hapus Berkas Pengajuan?',
            `Apakah Anda yakin ingin menghapus permohonan PKL dari siswa "${app.student.user.name}"?`,
            () => {
                router.delete(`/pkl/applications/${app.id}`);
            }
        );
    };

    const handleFilterSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/pkl/applications',
            {
                search: searchQuery,
                status: selectedStatus,
                major_id: selectedMajor,
                industry_id: selectedIndustry,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedStatus('');
        setSelectedMajor('');
        setSelectedIndustry('');
        router.get('/pkl/applications', {}, { preserveState: true, replace: true });
    };

    // ─────────────────────────────────────────────────────────────
    // RENDER 1: PORTAL SISWA
    // ─────────────────────────────────────────────────────────────
    if (isStudent) {
        const hasExisting = Boolean(myApplication);
        const isApproved = myApplication?.status === 'approved';
        const isSubmitted = myApplication?.status === 'submitted';
        const isRejected = myApplication?.status === 'rejected';

        return (
            <>
                <Head title="Pengajuan & Penempatan PKL - Portal Siswa" />

                <div className="flex flex-col gap-6 p-4 md:p-8 max-w-5xl mx-auto w-full">
                    {/* Header Banner Siswa */}
                    <div className="relative overflow-hidden rounded-3xl bg-[#181A20] text-white p-6 md:p-8 shadow-sm border border-[#232730]">
                        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D2F442]/20 text-[#D2F442] border border-[#D2F442]/30 mb-3">
                                    Tahun Ajaran {activeYear?.name || '2026/2027'}
                                </span>
                                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                    Portal Pengajuan & Penempatan PKL
                                </h1>
                                <p className="mt-1 text-xs md:text-sm text-white/70 font-medium">
                                    SMK Islam Terpadu Ar-Risalah Cariu • Praktik Kerja Lapangan
                                </p>

                                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                                    <span className="font-extrabold text-[#D2F442]">
                                        {student?.user?.name}
                                    </span>
                                    <span className="text-white/40">•</span>
                                    <span className="text-white/80">NIS: {student?.nis}</span>
                                    <span className="text-white/40">•</span>
                                    <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                                        {student?.major?.code} - {student?.classroom?.name}
                                    </span>
                                </div>
                            </div>

                            <div className="hidden sm:flex size-16 items-center justify-center rounded-2xl bg-[#D2F442] text-[#181A20] font-black shadow-lg">
                                <FontAwesomeIcon icon={faGraduationCap} className="size-8" />
                            </div>
                        </div>
                    </div>

                    {/* JIKA SUDAH MENGAJUKAN & TIDAK SEDANG FORM REAPPLY */}
                    {hasExisting && !isReapplying && (
                        <div className="space-y-6">
                            {/* KARTU STATUS PENGAJUAN */}
                            <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-xs">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-border">
                                    <div>
                                        <div className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                                            Status Berkas Pengajuan
                                        </div>
                                        <h2 className="text-xl font-black text-foreground mt-0.5">
                                            {isApproved && 'Pengajuan Diterima & Disetujui'}
                                            {isSubmitted && 'Menunggu Verifikasi Sekolah'}
                                            {isRejected && 'Pengajuan Tempat PKL Ditolak'}
                                        </h2>
                                    </div>

                                    <div>
                                        {isApproved && (
                                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-[#D2F442] text-[#181A20] shadow-2xs">
                                                <FontAwesomeIcon icon={faCircleCheck} className="size-4" />
                                                DISETUJUI (APPROVED)
                                            </span>
                                        )}
                                        {isSubmitted && (
                                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                                <FontAwesomeIcon icon={faClock} className="size-4" />
                                                MENUNGGU VERIFIKASI
                                            </span>
                                        )}
                                        {isRejected && (
                                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black bg-[#FF6B4A]/15 text-[#FF6B4A] border border-[#FF6B4A]/30">
                                                <FontAwesomeIcon icon={faCircleXmark} className="size-4" />
                                                DITOLAK (REJECTED)
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* ALASAN PENOLAKAN (JIKA REJECTED) */}
                                {isRejected && (
                                    <div className="mt-5 p-4 rounded-2xl bg-[#FF6B4A]/10 border border-[#FF6B4A]/20 text-xs text-foreground">
                                        <div className="flex items-center gap-2 font-black text-[#FF6B4A] mb-1">
                                            <FontAwesomeIcon icon={faCircleExclamation} className="size-3.5" />
                                            <span>Catatan Penolakan dari Koordinator PKL:</span>
                                        </div>
                                        <p className="font-semibold leading-relaxed">
                                            {myApplication?.rejection_reason || 'Silakan pilih industri mitra lainnya atau diskusikan dengan guru pembimbing.'}
                                        </p>
                                        <div className="mt-3">
                                            <button
                                                type="button"
                                                onClick={() => setIsReapplying(true)}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181A20] text-[#D2F442] font-extrabold text-xs hover:bg-[#202229] transition-all cursor-pointer"
                                            >
                                                <FontAwesomeIcon icon={faRotateRight} className="size-3" />
                                                <span>Pilih & Ajukan Tempat PKL Baru</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* DETAIL TEMPAT & TANGGAL PKL */}
                                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-[#181A20] text-[#D2F442] font-black">
                                                <FontAwesomeIcon icon={faBuilding} className="size-4" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase text-muted-foreground">
                                                    Perusahaan / DUDI Mitra
                                                </div>
                                                <div className="text-sm font-extrabold text-foreground">
                                                    {myApplication?.industry?.name}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-xs text-muted-foreground space-y-1 pt-1">
                                            <div className="flex items-start gap-2">
                                                <FontAwesomeIcon icon={faLocationDot} className="size-3 mt-0.5 shrink-0" />
                                                <span>{myApplication?.industry?.address}, {myApplication?.industry?.city}</span>
                                            </div>
                                            {myApplication?.industry?.phone && (
                                                <div className="flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faPhone} className="size-3 shrink-0" />
                                                    <span>{myApplication?.industry?.phone}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-[#181A20] text-[#D2F442] font-black">
                                                <FontAwesomeIcon icon={faCalendarDays} className="size-4" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase text-muted-foreground">
                                                    Jadwal Pelaksanaan PKL
                                                </div>
                                                <div className="text-sm font-extrabold text-foreground">
                                                    {formatDateIndo(myApplication?.start_date)} s/d {formatDateIndo(myApplication?.end_date)}
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                                            {isApproved
                                                ? 'Jadwal telah dikonfirmasi oleh sekolah. Seluruh presensi dan jurnal harian akan aktif selama periode ini.'
                                                : 'Jadwal masih dapat disesuaikan oleh koordinator PKL saat verifikasi berkas.'}
                                        </p>
                                    </div>
                                </div>

                                {isSubmitted && (
                                    <div className="mt-5 flex items-center justify-between pt-4 border-t border-border">
                                        <span className="text-xs text-muted-foreground font-medium">
                                            Ingin membatalkan pengajuan ini sebelum diverifikasi?
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => handleCancelApplication(myApplication.id)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#FF6B4A]/30 text-xs font-extrabold text-[#FF6B4A] hover:bg-[#FF6B4A] hover:text-white transition-colors cursor-pointer"
                                        >
                                            <FontAwesomeIcon icon={faTrash} className="size-3" />
                                            <span>Batalkan Pengajuan</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* KARTU PEMBIMBING (JIKA APPROVED) */}
                            {isApproved && (
                                <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-xs">
                                    <h3 className="text-base font-black text-foreground mb-1">
                                        Pembimbing Praktik Kerja Lapangan
                                    </h3>
                                    <p className="text-xs text-muted-foreground mb-5">
                                        Hubungi bapak/ibu pembimbing jika memerlukan bimbingan teknis atau monitoring penempatan.
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Guru Pembimbing Sekolah */}
                                        <div className="p-5 rounded-2xl border border-border bg-muted/40 flex items-start gap-3.5">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#181A20] text-[#D2F442] font-black">
                                                <FontAwesomeIcon icon={faChalkboardUser} className="size-4" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                                    Guru Pembimbing Sekolah
                                                </div>
                                                <div className="text-sm font-extrabold text-foreground mt-0.5">
                                                    {myApplication?.supervisor?.teacher?.user?.name || 'Sedang Ditugaskan...'}
                                                </div>
                                                {myApplication?.supervisor?.teacher?.nip && (
                                                    <div className="text-[11px] text-muted-foreground mt-0.5">
                                                        NIP: {myApplication.supervisor.teacher.nip}
                                                    </div>
                                                )}
                                                {myApplication?.supervisor?.teacher?.phone && (
                                                    <div className="text-[11px] text-foreground font-bold mt-1">
                                                        WA: {myApplication.supervisor.teacher.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Pembimbing Industri DUDI */}
                                        <div className="p-5 rounded-2xl border border-border bg-muted/40 flex items-start gap-3.5">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#D2F442] text-[#181A20] font-black">
                                                <FontAwesomeIcon icon={faUserCheck} className="size-4" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                                    Pembimbing Lapangan (DUDI)
                                                </div>
                                                <div className="text-sm font-extrabold text-foreground mt-0.5">
                                                    {myApplication?.supervisor?.industry_supervisor?.user?.name || 'Ditentukan oleh Perusahaan'}
                                                </div>
                                                {myApplication?.supervisor?.industry_supervisor?.position && (
                                                    <div className="text-[11px] text-muted-foreground mt-0.5">
                                                        Jabatan: {myApplication.supervisor.industry_supervisor.position}
                                                    </div>
                                                )}
                                                {myApplication?.supervisor?.industry_supervisor?.phone && (
                                                    <div className="text-[11px] text-foreground font-bold mt-1">
                                                        Telp: {myApplication.supervisor.industry_supervisor.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* FORM PENGAJUAN TEMPAT PKL (JIKA BELUM / REAPPLY) */}
                    {(!hasExisting || isReapplying) && (
                        <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-xs">
                            <div className="flex items-center justify-between pb-4 border-b border-border">
                                <div>
                                    <h2 className="text-xl font-black text-foreground">
                                        Formulir Pengajuan Tempat PKL
                                    </h2>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Pilih perusahaan mitra DUDI aktif tempat Anda ingin melaksanakan PKL.
                                    </p>
                                </div>
                                {isReapplying && (
                                    <button
                                        type="button"
                                        onClick={() => setIsReapplying(false)}
                                        className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                                    >
                                        Batal Ubah
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleStudentSubmit} className="mt-6 space-y-6">
                                {/* Pilihan DUDI */}
                                <div>
                                    <Label htmlFor="industry_select" className="text-xs font-black uppercase tracking-wider text-foreground">
                                        Pilih Perusahaan Mitra (DUDI) <span className="text-[#FF6B4A]">*</span>
                                    </Label>
                                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-1">
                                        {availableIndustries.map((ind) => {
                                            const isSelected = String(studentForm.data.industry_id) === String(ind.id);
                                            return (
                                                <div
                                                    key={ind.id}
                                                    onClick={() => studentForm.setData('industry_id', String(ind.id))}
                                                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${isSelected
                                                        ? 'border-[#D2F442] bg-[#181A20] dark:bg-card text-white shadow-sm'
                                                        : 'border-border bg-muted/40 text-foreground hover:bg-background hover:border-foreground/30'
                                                        }`}
                                                >
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="font-black text-sm">{ind.name}</div>
                                                        {isSelected && (
                                                            <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#D2F442] text-[#181A20] text-[10px]">
                                                                <FontAwesomeIcon icon={faCheck} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className={`text-xs mt-1.5 flex items-start gap-1.5 ${isSelected ? 'text-white/70' : 'text-muted-foreground'}`}>
                                                        <FontAwesomeIcon icon={faLocationDot} className="size-3 mt-0.5 shrink-0" />
                                                        <span className="line-clamp-2">{ind.address}, {ind.city}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    {studentForm.errors.industry_id && (
                                        <p className="mt-1.5 text-xs text-[#FF6B4A] font-bold">{studentForm.errors.industry_id}</p>
                                    )}
                                </div>

                                {/* Periode Tanggal */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="start_date" className="text-xs font-bold text-foreground">
                                            Rencana Tanggal Mulai <span className="text-[#FF6B4A]">*</span>
                                        </Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={studentForm.data.start_date}
                                            onChange={(e) => studentForm.setData('start_date', e.target.value)}
                                            className="mt-1.5 rounded-xl border-border bg-muted/40 text-xs font-semibold focus:border-foreground"
                                            required
                                        />
                                        {studentForm.errors.start_date && (
                                            <p className="mt-1 text-xs text-[#FF6B4A] font-bold">{studentForm.errors.start_date}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="end_date" className="text-xs font-bold text-foreground">
                                            Rencana Tanggal Selesai <span className="text-[#FF6B4A]">*</span>
                                        </Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={studentForm.data.end_date}
                                            onChange={(e) => studentForm.setData('end_date', e.target.value)}
                                            className="mt-1.5 rounded-xl border-border bg-muted/40 text-xs font-semibold focus:border-foreground"
                                            required
                                        />
                                        {studentForm.errors.end_date && (
                                            <p className="mt-1 text-xs text-[#FF6B4A] font-bold">{studentForm.errors.end_date}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={studentForm.processing || !studentForm.data.industry_id}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#181A20] px-6 py-3 text-xs md:text-sm font-extrabold text-[#D2F442] hover:bg-[#202229] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                    >
                                        <FontAwesomeIcon icon={faPaperPlane} className="size-3.5" />
                                        <span>{studentForm.processing ? 'Mengirim Pengajuan...' : 'Kirim Berkas Pengajuan PKL'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </>
        );
    }

    // ─────────────────────────────────────────────────────────────
    // RENDER 2: MANAJEMEN PENEMPATAN PKL (ADMIN / GURU / KEPSEK)
    // ─────────────────────────────────────────────────────────────
    return (
        <>
            <Head title="Manajemen Pengajuan & Penempatan PKL - SIARISA" />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#181A20] text-white">
                                <FontAwesomeIcon icon={faUserGraduate} className="size-4" />
                            </div>
                            <h1 className="text-2xl font-black tracking-tight text-foreground">
                                Pengajuan & Penempatan PKL
                            </h1>
                        </div>
                        <p className="mt-1 text-sm font-medium text-muted-foreground">
                            Verifikasi permohonan PKL siswa, konfirmasi tanggal pelaksanaan, dan penetapan pembimbing.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-2xl bg-card border border-border text-xs font-black text-foreground shadow-xs">
                            Tahun Ajaran: {activeYear?.name || '2026/2027'}
                        </span>
                    </div>
                </div>

                {/* KPI Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                    <div className="bg-card rounded-2xl p-4 border border-border shadow-xs">
                        <div className="text-[11px] font-black uppercase text-muted-foreground">Total Pengajuan</div>
                        <div className="text-2xl font-black text-foreground mt-1">{kpi?.total ?? 0}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Siswa terdaftar</div>
                    </div>

                    <div className="bg-card rounded-2xl p-4 border border-amber-500/30 shadow-xs">
                        <div className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400">Menunggu Verifikasi</div>
                        <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{kpi?.submitted ?? 0}</div>
                        <div className="text-[10px] text-amber-700/80 dark:text-amber-300/80 mt-0.5">Butuh persetujuan</div>
                    </div>

                    <div className="bg-card rounded-2xl p-4 border border-border shadow-xs">
                        <div className="text-[11px] font-black uppercase text-foreground">Disetujui (Approved)</div>
                        <div className="text-2xl font-black text-foreground mt-1 flex items-center gap-2">
                            <span>{kpi?.approved ?? 0}</span>
                            <span className="size-2 rounded-full bg-[#D2F442]" />
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Siap diterjunkan</div>
                    </div>

                    <div className="bg-card rounded-2xl p-4 border border-[#FF6B4A]/30 shadow-xs">
                        <div className="text-[11px] font-black uppercase text-[#FF6B4A]">Ditolak</div>
                        <div className="text-2xl font-black text-[#FF6B4A] mt-1">{kpi?.rejected ?? 0}</div>
                        <div className="text-[10px] text-[#FF6B4A]/80 mt-0.5">Perlu revisi DUDI</div>
                    </div>

                    <div className="col-span-2 lg:col-span-1 bg-card rounded-2xl p-4 border border-border shadow-xs">
                        <div className="text-[11px] font-black uppercase text-muted-foreground">Belum Ada Pembimbing</div>
                        <div className="text-2xl font-black text-foreground mt-1">{kpi?.no_supervisor ?? 0}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Perlu ditugaskan guru</div>
                    </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-card rounded-3xl p-5 border border-border shadow-xs space-y-4">
                    <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="lg:col-span-2 relative">
                            <FontAwesomeIcon
                                icon={faMagnifyingGlass}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground size-3.5"
                            />
                            <Input
                                type="text"
                                placeholder="Cari nama siswa, NIS, atau nama industri..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 rounded-xl border-border bg-muted/40 text-xs font-semibold focus:border-foreground"
                            />
                        </div>

                        <div>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground focus:border-foreground focus:ring-0 cursor-pointer"
                            >
                                <option value="">Semua Status</option>
                                <option value="submitted">Menunggu Verifikasi</option>
                                <option value="approved">Disetujui (Approved)</option>
                                <option value="rejected">Ditolak (Rejected)</option>
                            </select>
                        </div>

                        <div>
                            <select
                                value={selectedMajor}
                                onChange={(e) => setSelectedMajor(e.target.value)}
                                className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground focus:border-foreground focus:ring-0 cursor-pointer"
                            >
                                <option value="">Semua Jurusan</option>
                                {majors.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.code} - {m.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2">
                            <select
                                value={selectedIndustry}
                                onChange={(e) => setSelectedIndustry(e.target.value)}
                                className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground focus:border-foreground focus:ring-0 cursor-pointer"
                            >
                                <option value="">Semua Industri</option>
                                {industries.map((ind) => (
                                    <option key={ind.id} value={ind.id}>
                                        {ind.name}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="submit"
                                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#181A20] text-[#D2F442] hover:bg-[#202229] transition-colors cursor-pointer"
                                title="Terapkan Filter"
                            >
                                <FontAwesomeIcon icon={faFilter} className="size-3.5" />
                            </button>

                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                                title="Reset Filter"
                            >
                                <FontAwesomeIcon icon={faRotateRight} className="size-3.5" />
                            </button>
                        </div>
                    </form>
                </div>

                {/* Table Data */}
                <div className="bg-card rounded-3xl border border-border shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/40 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                                    <th className="px-6 py-4">Siswa & Rombel</th>
                                    <th className="px-6 py-4">DUDI / Industri Mitra</th>
                                    <th className="px-6 py-4">Periode Pelaksanaan</th>
                                    <th className="px-6 py-4">Pembimbing PKL</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    {isAdmin && <th className="px-6 py-4 text-right">Aksi</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60 font-medium text-foreground">
                                {!applications?.data || applications.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                            Tidak ada berkas pengajuan PKL yang sesuai kriteria pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    applications.data.map((app) => (
                                        <tr key={app.id} className="hover:bg-muted/40 transition-colors">
                                            {/* Siswa */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#181A20] text-[#D2F442] font-black">
                                                        <FontAwesomeIcon icon={faUserGraduate} className="size-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-sm text-foreground">
                                                            {app.student.user.name}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                                                            <span className="font-bold">NIS: {app.student.nis}</span>
                                                            <span>•</span>
                                                            <span className="px-1.5 py-0.2 rounded bg-[#D2F442] text-[#181A20] font-black text-[10px]">
                                                                {app.student.major?.code}
                                                            </span>
                                                            <span>{app.student.classroom?.name}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Industri */}
                                            <td className="px-6 py-4">
                                                <div className="font-extrabold text-xs text-foreground">
                                                    {app.industry.name}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                                    <FontAwesomeIcon icon={faLocationDot} className="size-2.5" />
                                                    <span>{app.industry.city || 'Kab. Bogor'}</span>
                                                </div>
                                            </td>

                                            {/* Periode */}
                                            <td className="px-6 py-4 text-xs">
                                                <div className="font-bold text-foreground">
                                                    {formatDateIndo(app.start_date)}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">
                                                    s/d {formatDateIndo(app.end_date)}
                                                </div>
                                            </td>

                                            {/* Pembimbing */}
                                            <td className="px-6 py-4 text-xs">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#181A20] text-[#D2F442]">
                                                            GURU
                                                        </span>
                                                        <span className="font-semibold text-foreground">
                                                            {app.supervisor?.teacher?.user?.name || (
                                                                <em className="text-muted-foreground text-[11px] not-italic">Belum ada</em>
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground">
                                                            DUDI
                                                        </span>
                                                        <span className="text-muted-foreground text-[11px]">
                                                            {app.supervisor?.industry_supervisor?.user?.name || '-'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 text-center">
                                                {app.status === 'approved' && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-[#D2F442] text-[#181A20] shadow-2xs">
                                                        <FontAwesomeIcon icon={faCheck} className="size-3" />
                                                        Disetujui
                                                    </span>
                                                )}
                                                {app.status === 'submitted' && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                                        <FontAwesomeIcon icon={faClock} className="size-3" />
                                                        Menunggu
                                                    </span>
                                                )}
                                                {app.status === 'rejected' && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-[#FF6B4A]/15 text-[#FF6B4A]">
                                                        <FontAwesomeIcon icon={faXmark} className="size-3" />
                                                        Ditolak
                                                    </span>
                                                )}
                                            </td>

                                            {/* Aksi */}
                                            {isAdmin && (
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* Tombol Verifikasi */}
                                                        <button
                                                            type="button"
                                                            onClick={() => openVerifyModal(app)}
                                                            className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-[#181A20] hover:text-[#D2F442] transition-colors cursor-pointer"
                                                            title="Verifikasi Pengajuan (Setujui / Tolak)"
                                                        >
                                                            <FontAwesomeIcon icon={faUserCheck} className="size-3.5" />
                                                        </button>

                                                        {/* Tombol Assign Supervisor */}
                                                        {app.status === 'approved' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => openAssignModal(app)}
                                                                className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-[#181A20] hover:text-[#D2F442] transition-colors cursor-pointer"
                                                                title="Tetapkan Pembimbing PKL"
                                                            >
                                                                <FontAwesomeIcon icon={faUserGear} className="size-3.5" />
                                                            </button>
                                                        )}

                                                        {/* Tombol Hapus */}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAdminDelete(app)}
                                                            className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-[#FF6B4A] hover:text-white transition-colors cursor-pointer"
                                                            title="Hapus / Batalkan Pengajuan"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} className="size-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {applications && applications.last_page > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/50 text-xs">
                            <span className="text-muted-foreground font-semibold">
                                Menampilkan {applications.from ?? 0} - {applications.to ?? 0} dari {applications.total} data
                            </span>
                            <div className="flex items-center gap-1">
                                {applications.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${link.active
                                            ? 'bg-[#181A20] text-[#D2F442]'
                                            : link.url
                                                ? 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                                                : 'text-muted-foreground/40 cursor-not-allowed'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL VERIFIKASI (APPROVE / REJECT) */}
            <Dialog open={!!verifyingApp} onOpenChange={() => setVerifyingApp(null)}>
                <DialogContent className="sm:max-w-lg rounded-3xl bg-card p-6 border border-border shadow-2xl">
                    <DialogHeader>
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-[#181A20] text-[#D2F442] mb-2 font-black">
                            <FontAwesomeIcon icon={faUserCheck} className="size-4" />
                        </div>
                        <DialogTitle className="text-xl font-black text-foreground">
                            Verifikasi Pengajuan PKL
                        </DialogTitle>
                        <DialogDescription className="text-xs font-medium text-muted-foreground">
                            Tentukan persetujuan penempatan PKL untuk <strong>{verifyingApp?.student.user.name}</strong> di <strong>{verifyingApp?.industry.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleVerifySubmit} className="space-y-4 pt-2">
                        {/* Pilihan Status */}
                        <div>
                            <Label className="text-xs font-bold text-foreground">
                                Keputusan Verifikasi <span className="text-[#FF6B4A]">*</span>
                            </Label>
                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <button
                                    type="button"
                                    onClick={() => verifyForm.setData('status', 'approved')}
                                    className={`py-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${verifyForm.data.status === 'approved'
                                        ? 'bg-[#181A20] border-[#181A20] text-[#D2F442] shadow-xs'
                                        : 'border-border text-muted-foreground hover:bg-muted/40'
                                        }`}
                                >
                                    <FontAwesomeIcon icon={faCheck} className="size-3.5" />
                                    <span>Setujui (Approve)</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => verifyForm.setData('status', 'rejected')}
                                    className={`py-3 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${verifyForm.data.status === 'rejected'
                                        ? 'bg-[#FF6B4A] border-[#FF6B4A] text-white shadow-xs'
                                        : 'border-border text-muted-foreground hover:bg-muted/40'
                                        }`}
                                >
                                    <FontAwesomeIcon icon={faXmark} className="size-3.5" />
                                    <span>Tolak (Reject)</span>
                                </button>
                            </div>
                        </div>

                        {/* Jika Disetujui: Konfirmasi Tanggal Pelaksanaan */}
                        {verifyForm.data.status === 'approved' && (
                            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-muted/40 border border-border">
                                <div>
                                    <Label htmlFor="v_start_date" className="text-xs font-bold text-foreground">
                                        Tanggal Mulai
                                    </Label>
                                    <Input
                                        id="v_start_date"
                                        type="date"
                                        value={verifyForm.data.start_date}
                                        onChange={(e) => verifyForm.setData('start_date', e.target.value)}
                                        className="mt-1 rounded-xl bg-background border-border text-xs font-semibold"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="v_end_date" className="text-xs font-bold text-foreground">
                                        Tanggal Selesai
                                    </Label>
                                    <Input
                                        id="v_end_date"
                                        type="date"
                                        value={verifyForm.data.end_date}
                                        onChange={(e) => verifyForm.setData('end_date', e.target.value)}
                                        className="mt-1 rounded-xl bg-background border-border text-xs font-semibold"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Jika Ditolak: Alasan Penolakan */}
                        {verifyForm.data.status === 'rejected' && (
                            <div>
                                <Label htmlFor="rejection_reason" className="text-xs font-bold text-foreground">
                                    Alasan Penolakan <span className="text-[#FF6B4A]">*</span>
                                </Label>
                                <textarea
                                    id="rejection_reason"
                                    rows={3}
                                    placeholder="Contoh: Kuota jurusan DKV di mitra ini sudah penuh. Silakan ajukan ke mitra lain."
                                    value={verifyForm.data.rejection_reason}
                                    onChange={(e) => verifyForm.setData('rejection_reason', e.target.value)}
                                    className="mt-1.5 w-full rounded-2xl border border-border bg-background p-3 text-xs font-semibold text-foreground focus:border-foreground focus:ring-0"
                                    required
                                />
                                {verifyForm.errors.rejection_reason && (
                                    <p className="mt-1 text-xs text-[#FF6B4A] font-bold">{verifyForm.errors.rejection_reason}</p>
                                )}
                            </div>
                        )}

                        <DialogFooter className="pt-4 gap-2 sm:gap-0">
                            <button
                                type="button"
                                onClick={() => setVerifyingApp(null)}
                                className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={verifyForm.processing}
                                className={`rounded-xl px-5 py-2 text-xs font-extrabold shadow-xs transition-colors cursor-pointer ${verifyForm.data.status === 'approved'
                                    ? 'bg-[#181A20] text-[#D2F442] hover:bg-[#202229]'
                                    : 'bg-[#FF6B4A] text-white hover:bg-[#E55A3B]'
                                    }`}
                            >
                                {verifyForm.processing ? 'Menyimpan...' : 'Simpan Keputusan'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL PENETAPAN PEMBIMBING (ASSIGN SUPERVISOR) */}
            <Dialog open={!!assigningApp} onOpenChange={() => setAssigningApp(null)}>
                <DialogContent className="sm:max-w-md rounded-3xl bg-card p-6 border border-border shadow-2xl">
                    <DialogHeader>
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-[#181A20] text-[#D2F442] mb-2 font-black">
                            <FontAwesomeIcon icon={faUserGear} className="size-4" />
                        </div>
                        <DialogTitle className="text-xl font-black text-foreground">
                            Tetapkan Pembimbing PKL
                        </DialogTitle>
                        <DialogDescription className="text-xs font-medium text-muted-foreground">
                            Tugaskan Guru Pembimbing dan Pembimbing Lapangan untuk <strong>{assigningApp?.student.user.name}</strong>.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAssignSubmit} className="space-y-4 pt-2">
                        {/* Guru Pembimbing Sekolah */}
                        <div>
                            <Label htmlFor="assign_teacher" className="text-xs font-bold text-foreground">
                                Guru Pembimbing Sekolah
                            </Label>
                            <select
                                id="assign_teacher"
                                value={assignForm.data.teacher_id}
                                onChange={(e) => assignForm.setData('teacher_id', e.target.value)}
                                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-foreground focus:ring-0"
                            >
                                <option value="">-- Pilih Guru Pembimbing --</option>
                                {teachers.map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.user.name} {t.nip ? `(NIP: ${t.nip})` : ''}
                                    </option>
                                ))}
                            </select>
                            {assignForm.errors.teacher_id && (
                                <p className="mt-1 text-xs text-[#FF6B4A] font-bold">{assignForm.errors.teacher_id}</p>
                            )}
                        </div>

                        {/* Pembimbing Industri Lapangan */}
                        <div>
                            <Label htmlFor="assign_industry_sup" className="text-xs font-bold text-foreground">
                                Pembimbing Lapangan Industri (DUDI)
                            </Label>
                            <select
                                id="assign_industry_sup"
                                value={assignForm.data.industry_supervisor_id}
                                onChange={(e) => assignForm.setData('industry_supervisor_id', e.target.value)}
                                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-foreground focus:ring-0"
                            >
                                <option value="">-- Pilih Pembimbing DUDI --</option>
                                {industrySupervisors.map((is) => (
                                    <option key={is.id} value={is.id}>
                                        {is.user.name} {is.position ? `(${is.position} - ${is.industry?.name})` : ''}
                                    </option>
                                ))}
                            </select>
                            {assignForm.errors.industry_supervisor_id && (
                                <p className="mt-1 text-xs text-[#FF6B4A] font-bold">{assignForm.errors.industry_supervisor_id}</p>
                            )}
                        </div>

                        <DialogFooter className="pt-4 gap-2 sm:gap-0">
                            <button
                                type="button"
                                onClick={() => setAssigningApp(null)}
                                className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={assignForm.processing}
                                className="rounded-xl bg-[#181A20] px-5 py-2 text-xs font-extrabold text-[#D2F442] hover:bg-[#202229] transition-colors cursor-pointer"
                            >
                                {assignForm.processing ? 'Menyimpan...' : 'Simpan Pembimbing'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}


