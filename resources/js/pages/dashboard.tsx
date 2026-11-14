import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import {
    faArrowRight,
    faAward,
    faBuilding,
    faCalendarDays,
    faChalkboardUser,
    faCheckCircle,
    faCircleExclamation,
    faFileLines,
    faPlus,
    faSchool,
    faUserGraduate,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { dashboard } from '@/routes';

interface DashboardStats {
    total_students?: number;
    total_industries?: number;
    total_teachers?: number;
    active_pkl?: number;
    pending_pkl?: number;
    pending_journals?: number;
}

interface RecentApp {
    id: number;
    student_name: string;
    student_nis: string;
    major_code: string;
    industry_name: string;
    status: string;
    status_label: string;
    status_color: string;
    created_at: string;
}

interface DashboardProps {
    stats: DashboardStats;
    recentApplications: RecentApp[];
    applicationTrend?: { labels: string[]; values: number[] };
    applicationStatuses?: { labels: string[]; values: number[] };
    activeYear?: { id: number; name: string } | null;
}

export default function Dashboard({
    stats,
    recentApplications = [],
    applicationTrend = { labels: [], values: [] },
    applicationStatuses = { labels: ['Diajukan', 'Disetujui', 'Ditolak'], values: [0, 0, 0] },
    activeYear,
}: DashboardProps) {
    const trendCanvas = useRef<HTMLCanvasElement>(null);
    const statusCanvas = useRef<HTMLCanvasElement>(null);
    const { auth, school } = usePage().props as {
        auth: { user: { name: string; roles?: string[] } };
        school?: { name: string; system_name: string };
    };

    const roles = auth?.user?.roles ?? [];
    const isAdmin = roles.includes('admin') || roles.includes('headmaster');

    useEffect(() => {
        if (!isAdmin || !trendCanvas.current || !statusCanvas.current) return;

        const trendChart = new Chart(trendCanvas.current, {
            type: 'bar',
            data: {
                labels: applicationTrend.labels,
                datasets: [{
                    label: 'Pengajuan',
                    data: applicationTrend.values,
                    backgroundColor: '#D2F442',
                    borderRadius: 8,
                    maxBarThickness: 42,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: true, ticks: { precision: 0 }, border: { display: false } },
                },
            },
        });
        const statusChart = new Chart(statusCanvas.current, {
            type: 'doughnut',
            data: {
                labels: applicationStatuses.labels,
                datasets: [{
                    data: applicationStatuses.values,
                    backgroundColor: ['#F59E0B', '#84CC16', '#FF6B4A'],
                    borderWidth: 0,
                    hoverOffset: 5,
                }],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 18 } } },
            },
        });

        return () => {
            trendChart.destroy();
            statusChart.destroy();
        };
    }, [isAdmin, applicationTrend, applicationStatuses]);

    const getStatusPill = (status: string, label: string) => {
        if (status === 'approved') {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D2F442]/30 px-3 py-1 text-xs font-bold text-[#181A20] border border-[#D2F442]">
                    <span className="size-1.5 rounded-full bg-[#181A20]" />
                    {label}
                </span>
            );
        }
        if (status === 'rejected') {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6B4A]/15 px-3 py-1 text-xs font-bold text-[#FF6B4A] border border-[#FF6B4A]/30">
                    <span className="size-1.5 rounded-full bg-[#FF6B4A]" />
                    {label}
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300">
                <span className="size-1.5 rounded-full bg-amber-500 animate-pulse" />
                {label}
            </span>
        );
    };

    return (
        <>
            <Head title="Dashboard - SIARISA" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Top Header Row (Starter Kit Structure + Eduplex Style) */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
                            Selamat Datang, {auth.user.name}
                        </h1>
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">
                            {school?.name || 'SMK Islam Terpadu Ar-Risalah Cariu'} &bull; Sistem Informasi PKL Terintegrasi PPDB
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-2 rounded-xl bg-card border border-border px-3.5 py-1.5 text-xs font-bold text-foreground shadow-2xs">
                            <FontAwesomeIcon icon={faCalendarDays} className="text-muted-foreground" />
                            <span>Tahun Ajaran {activeYear?.name || '2026/2027'}</span>
                        </div>
                    </div>
                </div>

                {/* 4 Overview Metric Cards */}
                {isAdmin && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Metric 1: DUDI Mitra */}
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs hover:border-[#D2F442] transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    DUDI Mitra
                                </span>
                                <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-foreground">
                                    <FontAwesomeIcon icon={faBuilding} className="size-4" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="text-3xl font-black text-foreground">
                                    {stats.total_industries ?? 0}
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Perusahaan aktif</span>
                                    <Link
                                        href="/master/industries"
                                        className="text-xs font-bold text-foreground hover:underline flex items-center gap-1 group"
                                    >
                                        Kelola
                                        <FontAwesomeIcon
                                            icon={faArrowRight}
                                            className="size-2.5 transition-transform group-hover:translate-x-0.5"
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Metric 2: Total Siswa */}
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs hover:border-[#D2F442] transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Data Siswa
                                </span>
                                <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-foreground">
                                    <FontAwesomeIcon icon={faUserGraduate} className="size-4" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="text-3xl font-black text-foreground">
                                    {stats.total_students ?? 0}
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Siswa terdaftar</span>
                                    <Link
                                        href="/master/students"
                                        className="text-xs font-bold text-foreground hover:underline flex items-center gap-1 group"
                                    >
                                        Lihat
                                        <FontAwesomeIcon
                                            icon={faArrowRight}
                                            className="size-2.5 transition-transform group-hover:translate-x-0.5"
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Metric 3: Guru Pembimbing */}
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs hover:border-[#D2F442] transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Guru Pembimbing
                                </span>
                                <div className="flex size-9 items-center justify-center rounded-xl bg-muted text-foreground">
                                    <FontAwesomeIcon icon={faChalkboardUser} className="size-4" />
                                </div>
                            </div>
                            <div className="mt-3">
                                <div className="text-3xl font-black text-foreground">
                                    {stats.total_teachers ?? 0}
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Pembimbing sekolah</span>
                                    <Link
                                        href="/master/teachers"
                                        className="text-xs font-bold text-foreground hover:underline flex items-center gap-1 group"
                                    >
                                        Lihat
                                        <FontAwesomeIcon
                                            icon={faArrowRight}
                                            className="size-2.5 transition-transform group-hover:translate-x-0.5"
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Metric 4: Pengajuan PKL Menunggu (Alert Style) */}
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs hover:border-[#FF6B4A] transition-colors">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                    Pengajuan Baru
                                </span>
                                <div
                                    className={`flex size-9 items-center justify-center rounded-xl ${
                                        (stats.pending_pkl ?? 0) > 0
                                            ? 'bg-[#FF6B4A]/15 text-[#FF6B4A]'
                                            : 'bg-muted text-foreground'
                                    }`}
                                >
                                    <FontAwesomeIcon
                                        icon={(stats.pending_pkl ?? 0) > 0 ? faCircleExclamation : faFileLines}
                                        className="size-4"
                                    />
                                </div>
                            </div>
                            <div className="mt-3">
                                <div
                                    className={`text-3xl font-black ${
                                        (stats.pending_pkl ?? 0) > 0 ? 'text-[#FF6B4A]' : 'text-foreground'
                                    }`}
                                >
                                    {stats.pending_pkl ?? 0}
                                </div>
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground">Menunggu verifikasi</span>
                                    <Link
                                        href="/pkl/applications"
                                        className="text-xs font-bold text-foreground hover:underline flex items-center gap-1 group"
                                    >
                                        Periksa
                                        <FontAwesomeIcon
                                            icon={faArrowRight}
                                            className="size-2.5 transition-transform group-hover:translate-x-0.5"
                                        />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isAdmin && (
                    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3" aria-label="Grafik pengajuan PKL">
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs lg:col-span-2">
                            <div className="mb-4">
                                <h2 className="text-base font-bold text-foreground">Tren Pengajuan PKL</h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">Jumlah pengajuan dalam enam bulan terakhir</p>
                            </div>
                            <div className="h-64"><canvas ref={trendCanvas} aria-label="Grafik batang tren pengajuan" role="img" /></div>
                        </div>
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
                            <div className="mb-4">
                                <h2 className="text-base font-bold text-foreground">Status Pengajuan</h2>
                                <p className="mt-0.5 text-xs text-muted-foreground">Komposisi pada tahun ajaran aktif</p>
                            </div>
                            <div className="h-64"><canvas ref={statusCanvas} aria-label="Grafik doughnut status pengajuan" role="img" /></div>
                        </div>
                    </section>
                )}

                {/* Middle Row: Progress Activity & Action Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Activity & Bobot Penilaian (2 Columns) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Card: Bobot Penilaian Resmi */}
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-9 items-center justify-center rounded-xl bg-[#D2F442] text-[#181A20]">
                                        <FontAwesomeIcon icon={faAward} className="size-4" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-foreground">
                                            Standar Bobot Penilaian PKL
                                        </h2>
                                        <p className="text-xs text-muted-foreground">
                                            Formula resmi perhitungan nilai akhir kompetensi siswa
                                        </p>
                                    </div>
                                </div>
                                <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-foreground">
                                    Sistem Otomatis
                                </span>
                            </div>

                            <div className="space-y-4 pt-1">
                                {/* Bar 1: DU/DI */}
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-foreground mb-1.5">
                                        <span>Pembimbing Industri (DU/DI)</span>
                                        <span className="text-sm font-black">60%</span>
                                    </div>
                                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                                        <div className="h-full bg-foreground rounded-full w-[60%]" />
                                    </div>
                                    <span className="text-[11px] text-muted-foreground mt-1 block">
                                        Aspek: Disiplin, etos kerja, keterampilan teknis, dan jurnal kegiatan harian.
                                    </span>
                                </div>

                                {/* Bar 2: Guru */}
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-foreground mb-1.5">
                                        <span>Guru Pembimbing Sekolah</span>
                                        <span className="text-sm font-black">40%</span>
                                    </div>
                                    <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                                        <div className="h-full bg-[#D2F442] rounded-full w-[40%]" />
                                    </div>
                                    <span className="text-[11px] text-muted-foreground mt-1 block">
                                        Aspek: Monitoring kunjungan, kepatuhan bimbingan, dan laporan akhir PKL.
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Applications Table */}
                        <div className="rounded-2xl border border-border bg-card shadow-2xs overflow-hidden">
                            <div className="flex items-center justify-between border-b border-border p-5">
                                <div>
                                    <h2 className="text-base font-bold text-foreground">
                                        Pengajuan Tempat PKL Terbaru
                                    </h2>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Data permohonan penempatan terkini dari siswa aktif
                                    </p>
                                </div>
                                <Link
                                    href="/pkl/applications"
                                    className="text-xs font-bold text-foreground hover:underline flex items-center gap-1 group"
                                >
                                    Semua Data
                                    <FontAwesomeIcon
                                        icon={faArrowRight}
                                        className="size-2.5 transition-transform group-hover:translate-x-0.5"
                                    />
                                </Link>
                            </div>

                            {recentApplications.length === 0 ? (
                                <div className="p-10 text-center">
                                    <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
                                        <FontAwesomeIcon icon={faFileLines} className="size-5" />
                                    </div>
                                    <p className="text-sm font-bold text-foreground">
                                        Belum Ada Pengajuan PKL
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                                        Siswa belum mengajukan penempatan tempat PKL pada periode ini.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-muted/50 text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
                                            <tr>
                                                <th className="px-5 py-3.5">Siswa</th>
                                                <th className="px-5 py-3.5">Jurusan</th>
                                                <th className="px-5 py-3.5">DUDI Tujuan</th>
                                                <th className="px-5 py-3.5">Status</th>
                                                <th className="px-5 py-3.5 text-right">Waktu</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {recentApplications.map((app) => (
                                                <tr
                                                    key={app.id}
                                                    className="hover:bg-muted/30 transition-colors"
                                                >
                                                    <td className="px-5 py-3.5">
                                                        <div className="font-bold text-foreground">
                                                            {app.student_name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            NIS: {app.student_nis}
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className="font-bold text-xs rounded-md bg-muted px-2 py-0.5 text-foreground">
                                                            {app.major_code}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 font-semibold text-foreground">
                                                        {app.industry_name}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        {getStatusPill(app.status, app.status_label)}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right text-xs text-muted-foreground">
                                                        {app.created_at}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Dark Action Card & Workflow */}
                    <div className="space-y-6">
                        {/* Dark Card: Direct Action Widget */}
                        <div className="rounded-2xl bg-[#181A20] text-white p-6 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[200px]">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 mb-3 backdrop-blur-xs">
                                    <FontAwesomeIcon icon={faSchool} className="text-[#D2F442]" />
                                    <span>SIARISA Core</span>
                                </div>
                                <h3 className="text-lg font-black text-white tracking-tight">
                                    Kelola DUDI Mitra
                                </h3>
                                <p className="text-xs text-[#8C93A0] mt-1.5 leading-relaxed">
                                    Tambah dan verifikasi perusahaan mitra tempat pelaksanaan PKL siswa angkatan ini.
                                </p>
                            </div>

                            <div className="mt-5">
                                <Link
                                    href="/master/industries"
                                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#D2F442] hover:bg-[#C4E835] px-4 py-2.5 text-sm font-extrabold text-[#181A20] transition-colors shadow-2xs"
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                    <span>Buka Master DUDI</span>
                                </Link>
                            </div>
                        </div>

                        {/* Alur Pelaksanaan PKL (Card) */}
                        <div className="rounded-2xl border border-border bg-card p-5 shadow-2xs">
                            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                                <FontAwesomeIcon icon={faCheckCircle} className="text-foreground" />
                                <span>Alur Pelaksanaan PKL</span>
                            </h3>

                            <div className="space-y-3">
                                {[
                                    {
                                        step: '01',
                                        title: 'Pendataan DUDI',
                                        desc: 'Admin input data mitra & kuota jurusan.',
                                    },
                                    {
                                        step: '02',
                                        title: 'Pengajuan Siswa',
                                        desc: 'Siswa memilih tempat PKL yang dituju.',
                                    },
                                    {
                                        step: '03',
                                        title: 'Verifikasi & SK',
                                        desc: 'Waka Humas menetapkan pembimbing & penempatan.',
                                    },
                                    {
                                        step: '04',
                                        title: 'Jurnal & Penilaian',
                                        desc: 'Absensi harian, validasi jurnal, dan input nilai 60/40.',
                                    },
                                ].map((item) => (
                                    <div key={item.step} className="flex items-start gap-3">
                                        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted font-black text-xs text-foreground border border-border">
                                            {item.step}
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-foreground">
                                                {item.title}
                                            </h4>
                                            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                                                {item.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
