import { Head, router, useForm } from '@inertiajs/react';
import {
    faBuilding,
    faCalendarCheck,
    faCalendarDays,
    faChalkboardUser,
    faCheck,
    faCheckCircle,
    faCircleCheck,
    faCircleExclamation,
    faCircleXmark,
    faClock,
    faLocationDot,
    faPenToSquare,
    faRightFromBracket,
    faRightToBracket,
    faRotateRight,
    faUserCheck,
    faUserGraduate,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
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

interface AttendanceItem {
    id: number;
    pkl_application_id: number;
    date: string;
    status: 'present' | 'permission' | 'sick' | 'absent';
    check_in: string | null;
    check_out: string | null;
    note: string | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedAttendances {
    data: AttendanceItem[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface Props {
    activeYear: { id: number; name: string } | null;
    application: {
        id: number;
        status: string;
        start_date: string | null;
        end_date: string | null;
        industry: {
            id: number;
            name: string;
            city: string | null;
            address: string | null;
        };
        supervisor?: {
            teacher?: {
                nip: string | null;
                user: { name: string; email: string };
            } | null;
            industry_supervisor?: {
                position: string | null;
                user: { name: string; email: string };
            } | null;
        } | null;
    } | null;
    todayAttendance: AttendanceItem | null;
    todayDate: string;
    attendances: PaginatedAttendances | null;
    stats: {
        total: number;
        present: number;
        permission: number;
        sick: number;
        absent: number;
        attendance_rate: number;
    };
}

export default function PklAttendanceIndex({
    activeYear,
    application,
    todayAttendance,
    todayDate,
    attendances,
    stats,
}: Props) {
    const alert = useSiarisaAlert();

    // Jam Digital Realtime
    const [currentTime, setCurrentTime] = useState(
        new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(
                new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
            );
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Form Presensi Masuk (Check-In)
    const checkInForm = useForm({
        date: todayDate,
        status: 'present' as 'present' | 'permission' | 'sick' | 'absent',
        check_in: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        note: '',
    });

    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

    const handleQuickCheckIn = () => {
        const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        checkInForm.setData({
            date: todayDate,
            status: 'present',
            check_in: timeNow,
            note: '',
        });

        alert.confirm(
            'Konfirmasi Presensi Hadir',
            `Catat kehadiran PKL Anda hari ini pada pukul ${timeNow}?`,
            () => {
                checkInForm.post('/pkl/attendance', {
                    preserveScroll: true,
                });
            }
        );
    };

    const handlePermissionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        checkInForm.post('/pkl/attendance', {
            onSuccess: () => {
                setIsPermissionModalOpen(false);
            },
        });
    };

    // Form Presensi Pulang (Check-Out)
    const handleCheckOut = (attId: number) => {
        const timeNow = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

        alert.confirm(
            'Konfirmasi Selesai PKL (Check-Out)',
            `Simpan jam kepulangan PKL hari ini pada pukul ${timeNow}?`,
            () => {
                router.put(
                    `/pkl/attendance/${attId}`,
                    {
                        check_out: timeNow,
                    },
                    {
                        preserveScroll: true,
                    }
                );
            }
        );
    };

    // Modal Edit Catatan Presensi
    const [editingAttendance, setEditingAttendance] = useState<AttendanceItem | null>(null);
    const editForm = useForm({
        note: '',
        status: 'present' as 'present' | 'permission' | 'sick' | 'absent',
    });

    const openEditModal = (att: AttendanceItem) => {
        setEditingAttendance(att);
        editForm.setData({
            note: att.note || '',
            status: att.status,
        });
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAttendance) return;

        editForm.put(`/pkl/attendance/${editingAttendance.id}`, {
            onSuccess: () => {
                setEditingAttendance(null);
            },
        });
    };

    return (
        <>
            <Head title="Absensi Harian PKL - Portal Siswa" />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-5xl mx-auto w-full">
                {/* Header Banner Siswa */}
                <div className="relative overflow-hidden rounded-3xl bg-[#181A20] text-white p-6 md:p-8 shadow-sm border border-[#232730]">
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D2F442]/20 text-[#D2F442] border border-[#D2F442]/30 mb-3">
                                Tahun Ajaran {activeYear?.name || '2026/2027'}
                            </span>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                Absensi Harian PKL
                            </h1>
                            <p className="mt-1 text-xs md:text-sm text-white/70 font-medium">
                                Catat waktu kedatangan dan kepulangan Anda di tempat praktik industri setiap hari kerja.
                            </p>

                            {application?.industry && (
                                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                                    <span className="font-extrabold text-[#D2F442]">
                                        {application.industry.name}
                                    </span>
                                    <span className="text-white/40">•</span>
                                    <span className="text-white/80">{application.industry.city || 'Mitra DUDI'}</span>
                                    <span className="text-white/40">•</span>
                                    <span className="px-2 py-0.5 rounded bg-white/10 text-white font-bold">
                                        {formatDateIndo(application.start_date)} s/d {formatDateIndo(application.end_date)}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="hidden sm:flex size-16 items-center justify-center rounded-2xl bg-[#D2F442] text-[#181A20] font-black shadow-lg">
                            <FontAwesomeIcon icon={faCalendarCheck} className="size-8" />
                        </div>
                    </div>
                </div>

                {/* JIKA BELUM ADA TEMPAT PKL APPROVED */}
                {!application && (
                    <div className="bg-card rounded-3xl p-8 border border-border text-center space-y-4 shadow-xs">
                        <div className="size-14 mx-auto rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                            <FontAwesomeIcon icon={faCircleExclamation} className="size-7" />
                        </div>
                        <div className="max-w-md mx-auto">
                            <h2 className="text-lg font-black text-foreground">
                                Belum Ada Penempatan PKL Aktif
                            </h2>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                                Anda belum dapat mengisi absensi karena berkas pengajuan tempat PKL Anda belum disetujui oleh pihak sekolah.
                            </p>
                        </div>
                        <div>
                            <button
                                type="button"
                                onClick={() => router.visit('/pkl/applications')}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#181A20] text-[#D2F442] font-black text-xs hover:bg-[#202229] transition-all cursor-pointer"
                            >
                                <span>Periksa Status Pengajuan PKL</span>
                            </button>
                        </div>
                    </div>
                )}

                {application && (
                    <>
                        {/* WIDGET PRESENSI HARI INI */}
                        <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-xs">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border">
                                <div>
                                    <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                                        Presensi Hari Ini
                                    </div>
                                    <div className="text-xl md:text-2xl font-black text-foreground mt-0.5">
                                        {formatDateIndo(todayDate)}
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2 font-medium">
                                        <FontAwesomeIcon icon={faClock} className="size-3 text-[#D2F442]" />
                                        <span>Waktu saat ini: <strong className="text-foreground font-mono">{currentTime} WIB</strong></span>
                                    </div>
                                </div>

                                {/* Status Card Hari Ini */}
                                <div className="flex items-center gap-3">
                                    {!todayAttendance && (
                                        <div className="flex flex-wrap items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={handleQuickCheckIn}
                                                disabled={checkInForm.processing}
                                                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#181A20] text-[#D2F442] font-black text-xs md:text-sm hover:bg-[#202229] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                            >
                                                <FontAwesomeIcon icon={faRightToBracket} className="size-4" />
                                                <span>Check-In Hadir</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    checkInForm.setData({
                                                        date: todayDate,
                                                        status: 'permission',
                                                        check_in: '',
                                                        note: '',
                                                    });
                                                    setIsPermissionModalOpen(true);
                                                }}
                                                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-border bg-muted/40 text-foreground font-bold text-xs hover:bg-background transition-colors cursor-pointer"
                                            >
                                                <FontAwesomeIcon icon={faPenToSquare} className="size-3.5" />
                                                <span>Ajukan Izin / Sakit</span>
                                            </button>
                                        </div>
                                    )}

                                    {todayAttendance && (
                                        <div className="flex flex-wrap items-center gap-3">
                                            {/* Badge Status */}
                                            {todayAttendance.status === 'present' && (
                                                <div className="px-4 py-2 rounded-2xl bg-[#D2F442]/20 border border-[#D2F442]/40 text-[#181A20] dark:text-[#D2F442] font-black text-xs flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faCircleCheck} className="size-4 text-emerald-600 dark:text-[#D2F442]" />
                                                    <span>HADIR HARI INI</span>
                                                </div>
                                            )}
                                            {todayAttendance.status === 'permission' && (
                                                <div className="px-4 py-2 rounded-2xl bg-blue-500/15 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-black text-xs flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faCalendarDays} className="size-4" />
                                                    <span>IZIN</span>
                                                </div>
                                            )}
                                            {todayAttendance.status === 'sick' && (
                                                <div className="px-4 py-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-black text-xs flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faCircleExclamation} className="size-4" />
                                                    <span>SAKIT</span>
                                                </div>
                                            )}
                                            {todayAttendance.status === 'absent' && (
                                                <div className="px-4 py-2 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-black text-xs flex items-center gap-2">
                                                    <FontAwesomeIcon icon={faCircleXmark} className="size-4" />
                                                    <span>ALPA</span>
                                                </div>
                                            )}

                                            {/* Tombol Check-Out jika Hadir dan belum Check-Out */}
                                            {todayAttendance.status === 'present' && !todayAttendance.check_out && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCheckOut(todayAttendance.id)}
                                                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#181A20] text-[#D2F442] font-black text-xs hover:bg-[#202229] transition-all shadow-xs cursor-pointer"
                                                >
                                                    <FontAwesomeIcon icon={faRightFromBracket} className="size-3.5" />
                                                    <span>Check-Out Pulang</span>
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Detail Presensi Hari Ini */}
                            {todayAttendance && (
                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-4 rounded-2xl bg-muted/40 border border-border">
                                        <div className="text-[10px] font-black uppercase text-muted-foreground">
                                            Jam Masuk (Check-In)
                                        </div>
                                        <div className="text-base font-extrabold text-foreground mt-0.5 font-mono">
                                            {todayAttendance.check_in || '-'}
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-muted/40 border border-border">
                                        <div className="text-[10px] font-black uppercase text-muted-foreground">
                                            Jam Pulang (Check-Out)
                                        </div>
                                        <div className="text-base font-extrabold text-foreground mt-0.5 font-mono">
                                            {todayAttendance.check_out || 'Belum Check-Out'}
                                        </div>
                                    </div>

                                    <div className="p-4 rounded-2xl bg-muted/40 border border-border">
                                        <div className="text-[10px] font-black uppercase text-muted-foreground">
                                            Keterangan / Catatan
                                        </div>
                                        <div className="text-xs font-semibold text-foreground mt-0.5 line-clamp-1">
                                            {todayAttendance.note || 'Tepat waktu'}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* STATISTIK KEHADIRAN BULANAN (KPI) */}
                        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
                            <div className="bg-card rounded-2xl p-4 border border-border shadow-xs">
                                <div className="text-[11px] font-black uppercase text-muted-foreground">Total Presensi</div>
                                <div className="text-2xl font-black text-foreground mt-1">{stats.total}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">Hari terekam</div>
                            </div>

                            <div className="bg-card rounded-2xl p-4 border border-border shadow-xs">
                                <div className="text-[11px] font-black uppercase text-emerald-600 dark:text-[#D2F442]">Hadir</div>
                                <div className="text-2xl font-black text-foreground mt-1 flex items-center gap-2">
                                    <span>{stats.present}</span>
                                    <span className="size-2 rounded-full bg-[#D2F442]" />
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">Hari kerja</div>
                            </div>

                            <div className="bg-card rounded-2xl p-4 border border-border shadow-xs">
                                <div className="text-[11px] font-black uppercase text-blue-600 dark:text-blue-400">Izin</div>
                                <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{stats.permission}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">Hari izin</div>
                            </div>

                            <div className="bg-card rounded-2xl p-4 border border-border shadow-xs">
                                <div className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400">Sakit</div>
                                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.sick}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">Dengan bukti</div>
                            </div>

                            <div className="bg-card rounded-2xl p-4 border border-border shadow-xs">
                                <div className="text-[11px] font-black uppercase text-rose-600 dark:text-rose-400">Alpa</div>
                                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.absent}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">Tanpa kabar</div>
                            </div>

                            <div className="col-span-2 lg:col-span-1 bg-card rounded-2xl p-4 border border-border shadow-xs">
                                <div className="text-[11px] font-black uppercase text-muted-foreground">% Kehadiran</div>
                                <div className="text-2xl font-black text-foreground mt-1">{stats.attendance_rate}%</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">Target min. 85%</div>
                            </div>
                        </div>

                        {/* RIWAYAT LOG ABSENSI */}
                        <div className="bg-card rounded-3xl border border-border shadow-xs overflow-hidden">
                            <div className="p-5 border-b border-border flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-black text-foreground">
                                        Riwayat Kehadiran PKL
                                    </h2>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        Daftar catatan harian jam masuk dan jam pulang selama penempatan di mitra industri.
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-muted/40 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                                            <th className="px-6 py-4">Tanggal</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Jam Masuk</th>
                                            <th className="px-6 py-4">Jam Pulang</th>
                                            <th className="px-6 py-4">Keterangan</th>
                                            <th className="px-6 py-4 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border font-medium text-foreground">
                                        {!attendances?.data || attendances.data.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                                    Belum ada catatan presensi yang tersimpan.
                                                </td>
                                            </tr>
                                        ) : (
                                            attendances.data.map((att) => (
                                                <tr key={att.id} className="hover:bg-muted/40 transition-colors">
                                                    <td className="px-6 py-4 font-extrabold text-xs">
                                                        {formatDateIndo(att.date)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {att.status === 'present' && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-[#D2F442]/20 text-[#181A20] dark:text-[#D2F442]">
                                                                <FontAwesomeIcon icon={faCheck} className="size-3" />
                                                                Hadir
                                                            </span>
                                                        )}
                                                        {att.status === 'permission' && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-blue-500/15 text-blue-600 dark:text-blue-400">
                                                                Izin
                                                            </span>
                                                        )}
                                                        {att.status === 'sick' && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                                                Sakit
                                                            </span>
                                                        )}
                                                        {att.status === 'absent' && (
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black bg-rose-500/15 text-rose-600 dark:text-rose-400">
                                                                Alpa
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-xs">
                                                        {att.check_in || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-xs">
                                                        {att.check_out || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-muted-foreground max-w-xs truncate">
                                                        {att.note || '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(att)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors cursor-pointer"
                                                        >
                                                            <FontAwesomeIcon icon={faPenToSquare} className="size-3" />
                                                            <span>Catatan</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {attendances && attendances.last_page > 1 && (
                                <div className="p-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                                    <div>
                                        Menampilkan {attendances.from ?? 0} s/d {attendances.to ?? 0} dari {attendances.total} catatan
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {attendances.links.map((link, idx) => (
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
                    </>
                )}
            </div>

            {/* MODAL PENGAJUAN IZIN / SAKIT */}
            <Dialog open={isPermissionModalOpen} onOpenChange={setIsPermissionModalOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl bg-card p-6 border border-border shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-foreground">
                            Pengajuan Izin / Keterangan Sakit
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            Sampaikan alasan ketidakhadiran PKL pada hari ini untuk diketahui sekolah dan pihak industri.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handlePermissionSubmit} className="space-y-4 mt-2">
                        <div>
                            <Label htmlFor="perm_status" className="text-xs font-bold text-foreground">
                                Kategori Ketidakhadiran <span className="text-rose-500">*</span>
                            </Label>
                            <select
                                id="perm_status"
                                value={checkInForm.data.status}
                                onChange={(e) => checkInForm.setData('status', e.target.value as any)}
                                className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground focus:border-foreground focus:ring-0 cursor-pointer"
                            >
                                <option value="permission">Izin (Keperluan Mendesak)</option>
                                <option value="sick">Sakit (Kondisi Medis)</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="perm_note" className="text-xs font-bold text-foreground">
                                Keterangan Lengkap / Alasan <span className="text-rose-500">*</span>
                            </Label>
                            <textarea
                                id="perm_note"
                                rows={3}
                                value={checkInForm.data.note}
                                onChange={(e) => checkInForm.setData('note', e.target.value)}
                                placeholder="Contoh: Mengalami demam tinggi dan flu, istirahat atas petunjuk dokter."
                                className="mt-1.5 w-full rounded-xl border border-border bg-background p-3 text-xs font-semibold text-foreground focus:border-foreground focus:ring-0"
                                required
                            />
                            {checkInForm.errors.note && (
                                <p className="mt-1 text-xs text-rose-500 font-bold">{checkInForm.errors.note}</p>
                            )}
                        </div>

                        <DialogFooter className="pt-3 gap-2 sm:gap-0">
                            <button
                                type="button"
                                onClick={() => setIsPermissionModalOpen(false)}
                                className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={checkInForm.processing}
                                className="rounded-xl bg-[#181A20] px-5 py-2 text-xs font-extrabold text-[#D2F442] hover:bg-[#202229] transition-colors cursor-pointer"
                            >
                                {checkInForm.processing ? 'Menyimpan...' : 'Kirim Keterangan'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL EDIT CATATAN PRESENSI */}
            <Dialog open={Boolean(editingAttendance)} onOpenChange={(open) => !open && setEditingAttendance(null)}>
                <DialogContent className="sm:max-w-md rounded-3xl bg-card p-6 border border-border shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-foreground">
                            Perbarui Catatan Presensi
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            Tanggal: {editingAttendance && formatDateIndo(editingAttendance.date)}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
                        <div>
                            <Label htmlFor="edit_note" className="text-xs font-bold text-foreground">
                                Catatan Tambahan
                            </Label>
                            <textarea
                                id="edit_note"
                                rows={3}
                                value={editForm.data.note}
                                onChange={(e) => editForm.setData('note', e.target.value)}
                                placeholder="Tambahkan catatan atau keterangan tugas khusus di tempat PKL..."
                                className="mt-1.5 w-full rounded-xl border border-border bg-background p-3 text-xs font-semibold text-foreground focus:border-foreground focus:ring-0"
                            />
                        </div>

                        <DialogFooter className="pt-3 gap-2 sm:gap-0">
                            <button
                                type="button"
                                onClick={() => setEditingAttendance(null)}
                                className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={editForm.processing}
                                className="rounded-xl bg-[#181A20] px-5 py-2 text-xs font-extrabold text-[#D2F442] hover:bg-[#202229] transition-colors cursor-pointer"
                            >
                                {editForm.processing ? 'Menyimpan...' : 'Simpan Catatan'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
