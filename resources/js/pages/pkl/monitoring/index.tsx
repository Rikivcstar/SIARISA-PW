import { Head, router } from '@inertiajs/react';
import {
    faBookOpenReader,
    faBuilding,
    faCalendarCheck,
    faCalendarDays,
    faChalkboardUser,
    faCheck,
    faCircleCheck,
    faCircleExclamation,
    faClock,
    faFilter,
    faGraduationCap,
    faLocationDot,
    faMagnifyingGlass,
    faRotateRight,
    faUserCheck,
    faUserGraduate,
    faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { formatDateIndo } from '@/lib/utils';

interface MonitoringStudent {
    id: number;
    nis: string;
    name: string;
    email: string;
    classroom: string;
    major_code: string;
    major_name: string;
}

interface MonitoringItem {
    id: number;
    student: MonitoringStudent;
    industry: {
        id: number;
        name: string;
        city: string | null;
    };
    period: {
        start_date: string | null;
        end_date: string | null;
    };
    supervisors: {
        teacher_name: string;
        industry_name: string;
    };
    attendance_summary: {
        total: number;
        present: number;
        permission: number;
        sick: number;
        absent: number;
        rate: number;
    };
    journal_summary: {
        total: number;
        validated: number;
        pending: number;
        rejected: number;
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedMonitoring {
    data: MonitoringItem[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface Props {
    activeYear: { id: number; name: string } | null;
    applications: PaginatedMonitoring;
    kpi: {
        total_students: number;
        attendance_rate: number;
        total_journals: number;
        pending_journals: number;
    };
    filters: {
        search?: string;
        major_id?: string;
        classroom_id?: string;
        industry_id?: string;
    };
    majors: { id: number; name: string; code: string }[];
    classrooms: { id: number; name: string }[];
    industries: { id: number; name: string }[];
}

export default function PklMonitoringIndex({
    activeYear,
    applications,
    kpi,
    filters,
    majors = [],
    classrooms = [],
    industries = [],
}: Props) {
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedMajor, setSelectedMajor] = useState(filters.major_id || '');
    const [selectedClassroom, setSelectedClassroom] = useState(filters.classroom_id || '');
    const [selectedIndustry, setSelectedIndustry] = useState(filters.industry_id || '');

    const handleFilterSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/pkl/monitoring',
            {
                search: searchQuery,
                major_id: selectedMajor,
                classroom_id: selectedClassroom,
                industry_id: selectedIndustry,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedMajor('');
        setSelectedClassroom('');
        setSelectedIndustry('');
        router.get('/pkl/monitoring', {}, { replace: true });
    };

    return (
        <>
            <Head title="Rekapitulasi Presensi & Jurnal PKL - Monitoring" />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#181A20] text-[#D2F442]">
                                <FontAwesomeIcon icon={faBookOpenReader} className="size-4" />
                            </div>
                            <h1 className="text-2xl font-black tracking-tight text-foreground">
                                Rekapitulasi Presensi & Jurnal PKL
                            </h1>
                        </div>
                        <p className="mt-1 text-sm font-medium text-muted-foreground">
                            Pemantauan terpusat keaktifan presensi harian dan rekap log jurnal seluruh siswa di tempat praktik industri.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-3.5 py-1.5 rounded-2xl bg-card border border-border text-xs font-black text-foreground shadow-xs">
                            Tahun Ajaran: {activeYear?.name || '2026/2027'}
                        </span>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="bg-card rounded-2xl p-4 border border-border shadow-xs">
                        <div className="text-[11px] font-black uppercase text-muted-foreground">Siswa Terjun PKL</div>
                        <div className="text-2xl font-black text-foreground mt-1">{kpi.total_students}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Penempatan aktif</div>
                    </div>

                    <div className="bg-card rounded-2xl p-4 border border-border shadow-xs">
                        <div className="text-[11px] font-black uppercase text-emerald-600 dark:text-[#D2F442]">Rata-Rata Kehadiran</div>
                        <div className="text-2xl font-black text-foreground mt-1 flex items-center gap-2">
                            <span>{kpi.attendance_rate}%</span>
                            <span className="size-2 rounded-full bg-[#D2F442]" />
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Akumulasi presensi</div>
                    </div>

                    <div className="bg-card rounded-2xl p-4 border border-border shadow-xs">
                        <div className="text-[11px] font-black uppercase text-foreground">Total Jurnal Disusun</div>
                        <div className="text-2xl font-black text-foreground mt-1">{kpi.total_journals}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Catatan kegiatan</div>
                    </div>

                    <div className="bg-card rounded-2xl p-4 border border-amber-500/30 shadow-xs">
                        <div className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400">Jurnal Belum Divalidasi</div>
                        <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{kpi.pending_journals}</div>
                        <div className="text-[10px] text-amber-600/80 mt-0.5">Perlu perhatian guru</div>
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
                                className="pl-10 rounded-xl border-border bg-muted/40 text-xs font-semibold"
                            />
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

                        <div>
                            <select
                                value={selectedClassroom}
                                onChange={(e) => setSelectedClassroom(e.target.value)}
                                className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground focus:border-foreground focus:ring-0 cursor-pointer"
                            >
                                <option value="">Semua Kelas</option>
                                {classrooms.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
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
                                <option value="">Semua Mitra DUDI</option>
                                {industries.map((ind) => (
                                    <option key={ind.id} value={ind.id}>
                                        {ind.name}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="submit"
                                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#181A20] text-[#D2F442] text-xs font-bold hover:bg-[#202229] transition-colors cursor-pointer"
                                title="Terapkan Filter"
                            >
                                <FontAwesomeIcon icon={faFilter} className="size-3" />
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

                {/* Table Data Monitoring */}
                <div className="bg-card rounded-3xl border border-border shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-border bg-muted/40 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                                    <th className="px-6 py-4">Siswa & Rombel</th>
                                    <th className="px-6 py-4">Industri & Pembimbing</th>
                                    <th className="px-6 py-4 text-center">Rekap Presensi</th>
                                    <th className="px-6 py-4 text-center">Progres Jurnal</th>
                                    <th className="px-6 py-4 text-center">Status Siswa</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border font-medium text-foreground">
                                {!applications?.data || applications.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                                            Tidak ada data penempatan PKL yang sesuai kriteria filter.
                                        </td>
                                    </tr>
                                ) : (
                                    applications.data.map((item) => (
                                        <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                                            {/* Siswa */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#181A20] text-[#D2F442] font-black">
                                                        <FontAwesomeIcon icon={faUserGraduate} className="size-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-sm text-foreground">
                                                            {item.student.name}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                                                            <span className="font-bold">NIS: {item.student.nis}</span>
                                                            <span>•</span>
                                                            <span className="px-1.5 py-0.2 rounded bg-[#D2F442] text-[#181A20] font-black text-[10px]">
                                                                {item.student.major_code}
                                                            </span>
                                                            <span>{item.student.classroom}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Industri & Pembimbing */}
                                            <td className="px-6 py-4 text-xs">
                                                <div className="font-extrabold text-foreground">
                                                    {item.industry.name}
                                                </div>
                                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                                    Guru: <strong className="text-foreground">{item.supervisors.teacher_name}</strong>
                                                </div>
                                                <div className="text-[11px] text-muted-foreground">
                                                    DUDI: <span>{item.supervisors.industry_name}</span>
                                                </div>
                                            </td>

                                            {/* Rekap Presensi */}
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="text-sm font-black text-foreground">
                                                        {item.attendance_summary.rate}%
                                                    </span>
                                                    <div className="w-20 bg-muted/60 rounded-full h-1.5 mt-1 overflow-hidden">
                                                        <div
                                                            className="bg-[#D2F442] h-1.5 rounded-full"
                                                            style={{ width: `${Math.min(100, item.attendance_summary.rate)}%` }}
                                                        />
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                                                        <span className="text-emerald-600 dark:text-[#D2F442] font-bold">H:{item.attendance_summary.present}</span>
                                                        <span>•</span>
                                                        <span>I:{item.attendance_summary.permission}</span>
                                                        <span>•</span>
                                                        <span>S:{item.attendance_summary.sick}</span>
                                                        <span>•</span>
                                                        <span className="text-rose-500 font-bold">A:{item.attendance_summary.absent}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Progres Jurnal */}
                                            <td className="px-6 py-4 text-center text-xs">
                                                <div className="inline-flex flex-col items-center">
                                                    <div className="font-extrabold text-foreground">
                                                        {item.journal_summary.validated} / {item.journal_summary.total}
                                                    </div>
                                                    <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                                                        <span className="text-emerald-600 dark:text-[#D2F442] font-semibold">Tervalidasi</span>
                                                        {item.journal_summary.pending > 0 && (
                                                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-[9px]">
                                                                +{item.journal_summary.pending} pending
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status Siswa */}
                                            <td className="px-6 py-4 text-center">
                                                {item.attendance_summary.rate >= 80 ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-[#D2F442]/20 text-[#181A20] dark:text-[#D2F442]">
                                                        <FontAwesomeIcon icon={faCheck} className="size-3" />
                                                        Aktif & Disiplin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                                        <FontAwesomeIcon icon={faCircleExclamation} className="size-3" />
                                                        Perlu Pantauan
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {applications && applications.last_page > 1 && (
                        <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                            <div>
                                Menampilkan {applications.from ?? 0} s/d {applications.to ?? 0} dari {applications.total} siswa
                            </div>
                            <div className="flex items-center gap-1">
                                {applications.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => link.url && router.visit(link.url)}
                                        disabled={!link.url}
                                        className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ${
                                            link.active
                                                ? 'bg-[#181A20] text-[#D2F442]'
                                                : 'hover:bg-muted/40 text-muted-foreground'
                                        } ${!link.url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
