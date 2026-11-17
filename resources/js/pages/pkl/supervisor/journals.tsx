import { Head, router, useForm } from '@inertiajs/react';
import {
    faArrowRotateLeft,
    faBookOpenReader,
    faBuilding,
    faCalendarDays,
    faCheck,
    faCircleCheck,
    faCircleExclamation,
    faCircleXmark,
    faClock,
    faFilter,
    faLocationDot,
    faMagnifyingGlass,
    faRotateRight,
    faUserCheck,
    faUserGraduate,
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

interface JournalSupervisorItem {
    id: number;
    pkl_application_id: number;
    date: string;
    activity: string;
    location: string | null;
    status: 'pending' | 'validated' | 'rejected';
    validated_at: string | null;
    rejection_reason: string | null;
    created_at: string;
    pkl_application: {
        id: number;
        student: {
            id: number;
            nis: string;
            user: { name: string; email: string };
            classroom?: { name: string } | null;
            major?: { name: string; code: string } | null;
        };
        industry: {
            id: number;
            name: string;
            city: string | null;
        };
    };
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedJournals {
    data: JournalSupervisorItem[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface Props {
    activeYear: { id: number; name: string } | null;
    journals: PaginatedJournals | null;
    kpi: {
        total: number;
        pending: number;
        validated: number;
        rejected: number;
    };
    filters: {
        status?: string;
        search?: string;
        date?: string;
    };
    userRole: string;
}

export default function SupervisorJournalsIndex({
    activeYear,
    journals,
    kpi,
    filters,
    userRole,
}: Props) {
    const alert = useSiarisaAlert();

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');
    const [selectedDate, setSelectedDate] = useState(filters.date || '');

    const handleFilterSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/pkl/supervisor/journals',
            {
                search: searchQuery,
                status: selectedStatus,
                date: selectedDate,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedStatus('');
        setSelectedDate('');
        router.get('/pkl/supervisor/journals', {}, { replace: true });
    };

    // Quick Approve
    const handleQuickApprove = (jnl: JournalSupervisorItem) => {
        alert.confirm(
            'Validasi & Setujui Jurnal',
            `Setujui catatan kegiatan "${jnl.pkl_application.student.user.name}" pada tanggal ${formatDateIndo(jnl.date)}?`,
            () => {
                router.put(`/pkl/supervisor/journals/${jnl.id}/validate`, {
                    status: 'validated',
                });
            }
        );
    };

    // Modal Reject / Catatan Revisi
    const [rejectingJournal, setRejectingJournal] = useState<JournalSupervisorItem | null>(null);
    const rejectForm = useForm({
        status: 'rejected',
        rejection_reason: '',
    });

    const openRejectModal = (jnl: JournalSupervisorItem) => {
        setRejectingJournal(jnl);
        rejectForm.clearErrors();
        rejectForm.setData({
            status: 'rejected',
            rejection_reason: jnl.rejection_reason || '',
        });
    };

    const handleRejectSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!rejectingJournal) return;

        rejectForm.put(`/pkl/supervisor/journals/${rejectingJournal.id}/validate`, {
            onSuccess: () => {
                setRejectingJournal(null);
            },
        });
    };

    return (
        <>
            <Head title="Validasi Jurnal Kegiatan PKL - Pembimbing" />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#181A20] text-[#D2F442]">
                                <FontAwesomeIcon icon={faUserCheck} className="size-4" />
                            </div>
                            <h1 className="text-2xl font-black tracking-tight text-foreground">
                                Validasi Jurnal PKL
                            </h1>
                        </div>
                        <p className="mt-1 text-sm font-medium text-muted-foreground">
                            Evaluasi dan setujui laporan log harian tugas praktik siswa bimbingan Anda di tempat industri.
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
                        <div className="text-[11px] font-black uppercase text-muted-foreground">Total Jurnal</div>
                        <div className="text-2xl font-black text-foreground mt-1">{kpi.total}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Siswa bimbingan</div>
                    </div>

                    <div className="bg-card rounded-2xl p-4 border border-amber-500/30 shadow-xs">
                        <div className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400">Menunggu Validasi</div>
                        <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{kpi.pending}</div>
                        <div className="text-[10px] text-amber-600/80 mt-0.5">Perlu pemeriksaan</div>
                    </div>

                    <div className="bg-card rounded-2xl p-4 border border-border shadow-xs">
                        <div className="text-[11px] font-black uppercase text-emerald-600 dark:text-[#D2F442]">Tervalidasi</div>
                        <div className="text-2xl font-black text-foreground mt-1 flex items-center gap-2">
                            <span>{kpi.validated}</span>
                            <span className="size-2 rounded-full bg-[#D2F442]" />
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">Disetujui pembimbing</div>
                    </div>

                    <div className="bg-card rounded-2xl p-4 border border-rose-500/30 shadow-xs">
                        <div className="text-[11px] font-black uppercase text-rose-600 dark:text-rose-400">Ditolak / Revisi</div>
                        <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{kpi.rejected}</div>
                        <div className="text-[10px] text-rose-600/80 mt-0.5">Catatan perbaikan</div>
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
                                placeholder="Cari nama siswa, NIS, atau uraian kegiatan..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 rounded-xl border-border bg-muted/40 text-xs font-semibold"
                            />
                        </div>

                        <div>
                            <select
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground focus:border-foreground focus:ring-0 cursor-pointer"
                            >
                                <option value="">Semua Status</option>
                                <option value="pending">Menunggu Validasi</option>
                                <option value="validated">Tervalidasi</option>
                                <option value="rejected">Ditolak / Revisi</option>
                            </select>
                        </div>

                        <div>
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full rounded-xl border-border bg-muted/40 px-3 py-2 text-xs font-semibold text-foreground"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                className="flex-1 inline-flex items-center justify-center gap-2 h-9 rounded-xl bg-[#181A20] text-[#D2F442] text-xs font-bold hover:bg-[#202229] transition-colors cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faFilter} className="size-3" />
                                <span>Filter</span>
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

                {/* List Jurnal Cards */}
                <div className="space-y-4">
                    {!journals?.data || journals.data.length === 0 ? (
                        <div className="bg-card rounded-3xl p-12 border border-border text-center text-muted-foreground shadow-xs">
                            <FontAwesomeIcon icon={faBookOpenReader} className="size-10 text-muted-foreground/40 mb-3" />
                            <p className="font-bold text-sm text-foreground">Tidak ada berkas jurnal yang sesuai kriteria.</p>
                            <p className="text-xs mt-1 text-muted-foreground">
                                Seluruh jurnal kegiatan siswa yang dikirimkan akan muncul di sini untuk diperiksa.
                            </p>
                        </div>
                    ) : (
                        journals.data.map((jnl) => (
                            <div
                                key={jnl.id}
                                className="bg-card rounded-3xl p-6 border border-border shadow-xs hover:border-foreground/20 transition-all space-y-4"
                            >
                                {/* Header Card: Siswa & Status */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#181A20] text-[#D2F442] font-black">
                                            <FontAwesomeIcon icon={faUserGraduate} className="size-4" />
                                        </div>
                                        <div>
                                            <div className="font-extrabold text-sm text-foreground">
                                                {jnl.pkl_application.student.user.name}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                <span>NIS: {jnl.pkl_application.student.nis}</span>
                                                <span>•</span>
                                                <span className="px-1.5 py-0.2 rounded bg-[#D2F442] text-[#181A20] font-black text-[10px]">
                                                    {jnl.pkl_application.student.major?.code}
                                                </span>
                                                <span>{jnl.pkl_application.student.classroom?.name}</span>
                                                <span>•</span>
                                                <span className="font-semibold text-foreground/80">
                                                    {jnl.pkl_application.industry.name}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="text-right hidden sm:block text-xs">
                                            <div className="font-bold text-foreground">
                                                {formatDateIndo(jnl.date)}
                                            </div>
                                            {jnl.location && (
                                                <div className="text-[11px] text-muted-foreground">
                                                    {jnl.location}
                                                </div>
                                            )}
                                        </div>

                                        {jnl.status === 'validated' && (
                                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-[#D2F442]/20 text-[#181A20] dark:text-[#D2F442]">
                                                <FontAwesomeIcon icon={faCircleCheck} className="size-3 text-emerald-600 dark:text-[#D2F442]" />
                                                <span>TERVALIDASI</span>
                                            </span>
                                        )}
                                        {jnl.status === 'pending' && (
                                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-amber-500/15 text-amber-600 dark:text-amber-400">
                                                <FontAwesomeIcon icon={faClock} className="size-3" />
                                                <span>MENUNGGU VALIDASI</span>
                                            </span>
                                        )}
                                        {jnl.status === 'rejected' && (
                                            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-rose-500/15 text-rose-600 dark:text-rose-400">
                                                <FontAwesomeIcon icon={faCircleXmark} className="size-3" />
                                                <span>DITOLAK / REVISI</span>
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Detail Aktivitas Siswa */}
                                <div className="space-y-1">
                                    <div className="text-[10px] font-black uppercase text-muted-foreground">
                                        Rincian Kegiatan Praktik Siswa:
                                    </div>
                                    <p className="text-xs md:text-sm text-foreground/90 font-medium leading-relaxed whitespace-pre-line p-4 rounded-2xl bg-muted/40 border border-border">
                                        {jnl.activity}
                                    </p>
                                </div>

                                {/* Catatan Revisi Sebelumnya jika ada */}
                                {jnl.rejection_reason && (
                                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs">
                                        <div className="font-bold text-rose-600 dark:text-rose-400 mb-0.5">
                                            Catatan Revisi dari Pembimbing:
                                        </div>
                                        <p className="text-foreground font-semibold leading-relaxed">
                                            {jnl.rejection_reason}
                                        </p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-border">
                                    <div className="text-muted-foreground text-[11px]">
                                        {jnl.validated_at && `Divalidasi pada ${new Date(jnl.validated_at).toLocaleDateString('id-ID')}`}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {jnl.status !== 'validated' && (
                                            <button
                                                type="button"
                                                onClick={() => handleQuickApprove(jnl)}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#181A20] text-[#D2F442] font-black text-xs hover:bg-[#202229] transition-all cursor-pointer shadow-xs"
                                            >
                                                <FontAwesomeIcon icon={faCheck} className="size-3" />
                                                <span>Setujui (Validasi)</span>
                                            </button>
                                        )}

                                        {jnl.status !== 'rejected' && (
                                            <button
                                                type="button"
                                                onClick={() => openRejectModal(jnl)}
                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                                            >
                                                <FontAwesomeIcon icon={faXmark} className="size-3" />
                                                <span>Tolak / Beri Catatan</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {journals && journals.last_page > 1 && (
                    <div className="p-4 bg-card rounded-2xl border border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                        <div>
                            Menampilkan {journals.from ?? 0} s/d {journals.to ?? 0} dari {journals.total} berkas jurnal
                        </div>
                        <div className="flex items-center gap-1">
                            {journals.links.map((link, idx) => (
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

            {/* MODAL TOLAK / CATATAN REVISI JURNAL */}
            <Dialog open={Boolean(rejectingJournal)} onOpenChange={(open) => !open && setRejectingJournal(null)}>
                <DialogContent className="sm:max-w-md rounded-3xl bg-card p-6 border border-border shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-foreground">
                            Tolak & Minta Revisi Jurnal
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            Siswa: {rejectingJournal?.pkl_application.student.user.name} ({rejectingJournal && formatDateIndo(rejectingJournal.date)})
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleRejectSubmit} className="space-y-4 mt-2">
                        <div>
                            <Label htmlFor="rej_reason" className="text-xs font-bold text-foreground">
                                Catatan Evaluasi & Alasan Penolakan <span className="text-rose-500">*</span>
                            </Label>
                            <textarea
                                id="rej_reason"
                                rows={4}
                                value={rejectForm.data.rejection_reason}
                                onChange={(e) => rejectForm.setData('rejection_reason', e.target.value)}
                                placeholder="Jelaskan kekurangan laporan jurnal siswa dan arahan perbaikannya..."
                                className="mt-1.5 w-full rounded-xl border border-border bg-background p-3 text-xs font-semibold text-foreground focus:border-foreground focus:ring-0 leading-relaxed"
                                required
                            />
                            {rejectForm.errors.rejection_reason && (
                                <p className="mt-1 text-xs text-rose-500 font-bold">{rejectForm.errors.rejection_reason}</p>
                            )}
                        </div>

                        <DialogFooter className="pt-3 gap-2 sm:gap-0">
                            <button
                                type="button"
                                onClick={() => setRejectingJournal(null)}
                                className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={rejectForm.processing}
                                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-extrabold text-white hover:bg-rose-700 transition-colors cursor-pointer"
                            >
                                {rejectForm.processing ? 'Menyimpan...' : 'Kirim Catatan Penolakan'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
