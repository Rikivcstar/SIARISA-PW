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
    faLocationDot,
    faLock,
    faPaperPlane,
    faPenToSquare,
    faPlus,
    faRotateRight,
    faTrash,
    faUserCheck,
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

interface JournalItem {
    id: number;
    pkl_application_id: number;
    date: string;
    activity: string;
    location: string | null;
    status: 'pending' | 'validated' | 'rejected';
    validated_at: string | null;
    rejection_reason: string | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedJournals {
    data: JournalItem[];
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
    journals: PaginatedJournals | null;
    stats: {
        total: number;
        validated: number;
        pending: number;
        rejected: number;
    };
    todayDate: string;
}

export default function PklJournalIndex({
    activeYear,
    application,
    journals,
    stats,
    todayDate,
}: Props) {
    const alert = useSiarisaAlert();

    // Modal Tambah / Edit Jurnal
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [editingJournal, setEditingJournal] = useState<JournalItem | null>(null);

    const journalForm = useForm({
        date: todayDate,
        location: '',
        activity: '',
    });

    const openCreateModal = () => {
        setEditingJournal(null);
        journalForm.clearErrors();
        journalForm.setData({
            date: todayDate,
            location: '',
            activity: '',
        });
        setIsFormModalOpen(true);
    };

    const openEditModal = (jnl: JournalItem) => {
        setEditingJournal(jnl);
        journalForm.clearErrors();
        journalForm.setData({
            date: jnl.date,
            location: jnl.location || '',
            activity: jnl.activity,
        });
        setIsFormModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingJournal) {
            journalForm.put(`/pkl/journal/${editingJournal.id}`, {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                    setEditingJournal(null);
                },
            });
        } else {
            journalForm.post('/pkl/journal', {
                onSuccess: () => {
                    setIsFormModalOpen(false);
                },
            });
        }
    };

    const handleDelete = (jnl: JournalItem) => {
        alert.deleteConfirm(
            'Hapus Jurnal Kegiatan?',
            `Apakah Anda yakin ingin menghapus catatan kegiatan pada tanggal ${formatDateIndo(jnl.date)}?`,
            () => {
                router.delete(`/pkl/journal/${jnl.id}`);
            }
        );
    };

    return (
        <>
            <Head title="Jurnal Kegiatan PKL - Portal Siswa" />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-5xl mx-auto w-full">
                {/* Header Banner Siswa */}
                <div className="relative overflow-hidden rounded-3xl bg-[#181A20] text-white p-6 md:p-8 shadow-sm border border-[#232730]">
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#D2F442]/20 text-[#D2F442] border border-[#D2F442]/30 mb-3">
                                Tahun Ajaran {activeYear?.name || '2026/2027'}
                            </span>
                            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                                Jurnal Kegiatan PKL
                            </h1>
                            <p className="mt-1 text-xs md:text-sm text-white/70 font-medium">
                                Dokumentasikan seluruh tugas dan aktivitas pekerjaan praktik yang Anda kerjakan di tempat industri.
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
                                        Guru: {application.supervisor?.teacher?.user.name || 'Sedang Ditugaskan'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="hidden sm:flex size-16 items-center justify-center rounded-2xl bg-[#D2F442] text-[#181A20] font-black shadow-lg">
                            <FontAwesomeIcon icon={faBookOpenReader} className="size-8" />
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
                                Pengisian jurnal harian hanya dapat dilakukan setelah permohonan PKL Anda disetujui oleh pihak sekolah.
                            </p>
                        </div>
                    </div>
                )}

                {application && (
                    <>
                        {/* KPI STATISTIK JURNAL */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="bg-card rounded-2xl p-4 border border-border shadow-xs">
                                <div className="text-[11px] font-black uppercase text-muted-foreground">Total Jurnal</div>
                                <div className="text-2xl font-black text-foreground mt-1">{stats.total}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">Kegiatan tercatat</div>
                            </div>

                            <div className="bg-card rounded-2xl p-4 border border-border shadow-xs">
                                <div className="text-[11px] font-black uppercase text-emerald-600 dark:text-[#D2F442]">Tervalidasi</div>
                                <div className="text-2xl font-black text-foreground mt-1 flex items-center gap-2">
                                    <span>{stats.validated}</span>
                                    <span className="size-2 rounded-full bg-[#D2F442]" />
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">Disetujui pembimbing</div>
                            </div>

                            <div className="bg-card rounded-2xl p-4 border border-border shadow-xs">
                                <div className="text-[11px] font-black uppercase text-amber-600 dark:text-amber-400">Menunggu Validasi</div>
                                <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.pending}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">Dalam antrean guru/DUDI</div>
                            </div>

                            <div className="bg-card rounded-2xl p-4 border border-border shadow-xs">
                                <div className="text-[11px] font-black uppercase text-rose-600 dark:text-rose-400">Perlu Revisi</div>
                                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.rejected}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">Ditolak dengan catatan</div>
                            </div>
                        </div>

                        {/* TOMBOL AKSI & TIMELINE JURNAL */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-black text-foreground">
                                    Log Aktivitas Harian
                                </h2>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Daftar catatan pekerjaan dan bimbingan lapangan yang Anda laporkan.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#181A20] text-[#D2F442] font-black text-xs hover:bg-[#202229] transition-all shadow-xs cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faPlus} className="size-3" />
                                <span>Tulis Jurnal Baru</span>
                            </button>
                        </div>

                        {/* LIST JURNAL ITEMS */}
                        <div className="space-y-4">
                            {!journals?.data || journals.data.length === 0 ? (
                                <div className="bg-card rounded-3xl p-12 border border-border text-center text-muted-foreground shadow-xs">
                                    <FontAwesomeIcon icon={faBookOpenReader} className="size-10 text-muted-foreground/40 mb-3" />
                                    <p className="font-bold text-sm text-foreground">Belum ada catatan jurnal kegiatan.</p>
                                    <p className="text-xs mt-1 text-muted-foreground">
                                        Klik tombol "Tulis Jurnal Baru" di atas untuk mencatat kegiatan PKL pertama Anda.
                                    </p>
                                </div>
                            ) : (
                                journals.data.map((jnl) => (
                                    <div
                                        key={jnl.id}
                                        className="bg-card rounded-3xl p-6 border border-border shadow-xs hover:border-foreground/20 transition-all space-y-4"
                                    >
                                        {/* Row 1: Header Item */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-9 items-center justify-center rounded-xl bg-[#181A20] text-[#D2F442] font-black">
                                                    <FontAwesomeIcon icon={faCalendarDays} className="size-4" />
                                                </div>
                                                <div>
                                                    <div className="font-extrabold text-sm text-foreground">
                                                        {formatDateIndo(jnl.date)}
                                                    </div>
                                                    {jnl.location && (
                                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                                            <FontAwesomeIcon icon={faLocationDot} className="size-2.5" />
                                                            <span>{jnl.location}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div>
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
                                                        <span>PERLU REVISI</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Row 2: Rincian Kegiatan */}
                                        <div className="text-xs md:text-sm text-foreground/90 font-medium leading-relaxed whitespace-pre-line">
                                            {jnl.activity}
                                        </div>

                                        {/* Row 3: Jika Rejected, tampilkan Catatan Evaluasi dari Pembimbing */}
                                        {jnl.status === 'rejected' && jnl.rejection_reason && (
                                            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs">
                                                <div className="flex items-center gap-2 font-black text-rose-600 dark:text-rose-400 mb-1">
                                                    <FontAwesomeIcon icon={faCircleExclamation} className="size-3.5" />
                                                    <span>Catatan Evaluasi / Alasan Penolakan dari Pembimbing:</span>
                                                </div>
                                                <p className="font-semibold text-foreground leading-relaxed">
                                                    {jnl.rejection_reason}
                                                </p>
                                            </div>
                                        )}

                                        {/* Row 4: Action Footer */}
                                        <div className="pt-2 flex items-center justify-between text-xs">
                                            <div>
                                                {jnl.status === 'validated' && (
                                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-semibold">
                                                        <FontAwesomeIcon icon={faLock} className="size-2.5" />
                                                        Jurnal telah disahkan dan dikunci.
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {jnl.status !== 'validated' && (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(jnl)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-bold text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                                                        >
                                                            <FontAwesomeIcon icon={faPenToSquare} className="size-3" />
                                                            <span>{jnl.status === 'rejected' ? 'Revisi Jurnal' : 'Edit'}</span>
                                                        </button>

                                                        {jnl.status === 'pending' && (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleDelete(jnl)}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 text-xs font-bold text-rose-500 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                                                            >
                                                                <FontAwesomeIcon icon={faTrash} className="size-3" />
                                                                <span>Hapus</span>
                                                            </button>
                                                        )}
                                                    </>
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
                                    Menampilkan {journals.from ?? 0} s/d {journals.to ?? 0} dari {journals.total} jurnal
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
                    </>
                )}
            </div>

            {/* MODAL FORM TAMBAH / EDIT JURNAL */}
            <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
                <DialogContent className="sm:max-w-lg rounded-3xl bg-card p-6 border border-border shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-foreground">
                            {editingJournal ? (editingJournal.status === 'rejected' ? 'Revisi Jurnal Kegiatan' : 'Perbarui Jurnal Kegiatan') : 'Tulis Jurnal Kegiatan PKL'}
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                            Rincikan pekerjaan, tugas teknis, dan pembelajaran yang Anda laksanakan pada hari ini.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleFormSubmit} className="space-y-4 mt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="jnl_date" className="text-xs font-bold text-foreground">
                                    Tanggal Kegiatan <span className="text-rose-500">*</span>
                                </Label>
                                <Input
                                    id="jnl_date"
                                    type="date"
                                    value={journalForm.data.date}
                                    onChange={(e) => journalForm.setData('date', e.target.value)}
                                    className="mt-1.5 rounded-xl border-border bg-background text-xs font-semibold"
                                    required
                                />
                                {journalForm.errors.date && (
                                    <p className="mt-1 text-xs text-rose-500 font-bold">{journalForm.errors.date}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="jnl_location" className="text-xs font-bold text-foreground">
                                    Divisi / Lokasi Penugasan
                                </Label>
                                <Input
                                    id="jnl_location"
                                    type="text"
                                    placeholder="Contoh: Divisi IT & Desain"
                                    value={journalForm.data.location}
                                    onChange={(e) => journalForm.setData('location', e.target.value)}
                                    className="mt-1.5 rounded-xl border-border bg-background text-xs font-semibold"
                                />
                                {journalForm.errors.location && (
                                    <p className="mt-1 text-xs text-rose-500 font-bold">{journalForm.errors.location}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="jnl_activity" className="text-xs font-bold text-foreground">
                                Rincian Aktivitas & Kegiatan <span className="text-rose-500">*</span>
                            </Label>
                            <textarea
                                id="jnl_activity"
                                rows={5}
                                value={journalForm.data.activity}
                                onChange={(e) => journalForm.setData('activity', e.target.value)}
                                placeholder="Jelaskan secara runtut pekerjaan yang dikerjakan, software/alat yang dipakai, dan hasil yang dicapai..."
                                className="mt-1.5 w-full rounded-xl border border-border bg-background p-3 text-xs font-semibold text-foreground focus:border-foreground focus:ring-0 leading-relaxed"
                                required
                            />
                            {journalForm.errors.activity && (
                                <p className="mt-1 text-xs text-rose-500 font-bold">{journalForm.errors.activity}</p>
                            )}
                            <div className="flex justify-between items-center text-[11px] text-muted-foreground mt-1">
                                <span>Minimal 10 karakter</span>
                                <span>{journalForm.data.activity.length} karakter</span>
                            </div>
                        </div>

                        <DialogFooter className="pt-3 gap-2 sm:gap-0">
                            <button
                                type="button"
                                onClick={() => setIsFormModalOpen(false)}
                                className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={journalForm.processing}
                                className="rounded-xl bg-[#181A20] px-5 py-2 text-xs font-extrabold text-[#D2F442] hover:bg-[#202229] transition-colors cursor-pointer"
                            >
                                {journalForm.processing ? 'Menyimpan...' : (editingJournal ? 'Kirim Revisi' : 'Simpan Jurnal')}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
