import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    faBriefcase,
    faChalkboardUser,
    faCheckCircle,
    faCircleExclamation,
    faEnvelope,
    faIdCard,
    faLocationDot,
    faMagnifyingGlass,
    faPenToSquare,
    faPhone,
    faPlus,
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

interface UserData {
    id: number;
    name: string;
    email: string;
}

interface TeacherItem {
    id: number;
    user_id: number;
    nip: string | null;
    phone: string | null;
    address: string | null;
    user: UserData;
    supervisor_assignments_count?: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedTeachers {
    data: TeacherItem[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface Props {
    teachers: PaginatedTeachers;
    filters: {
        search: string;
    };
}

export default function MasterTeachers({ teachers, filters }: Props) {
    const { flash, auth } = usePage().props as {
        flash?: { success?: string; error?: string };
        auth: { user: { roles?: string[] } };
    };

    const isAdmin = auth.user.roles?.includes('admin');
    const alert = useSiarisaAlert();
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState<TeacherItem | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        nip: '',
        phone: '',
        address: '',
    });

    const openCreateModal = () => {
        setEditingTeacher(null);
        reset();
        clearErrors();
        setData({
            name: '',
            email: '',
            password: '',
            nip: '',
            phone: '',
            address: '',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (teacher: TeacherItem) => {
        setEditingTeacher(teacher);
        clearErrors();
        setData({
            name: teacher.user.name,
            email: teacher.user.email,
            password: '',
            nip: teacher.nip || '',
            phone: teacher.phone || '',
            address: teacher.address || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingTeacher) {
            put(`/master/teachers/${editingTeacher.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingTeacher(null);
                },
            });
        } else {
            post('/master/teachers', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (teacher: TeacherItem) => {
        alert.deleteConfirm(
            'Hapus Guru Pembimbing?',
            `Apakah Anda yakin ingin menghapus guru "${teacher.user.name}"? Akun pengguna guru ini juga akan dihapus.`,
            () => {
                router.delete(`/master/teachers/${teacher.id}`);
            },
        );
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/master/teachers',
            { search: searchQuery },
            { preserveState: true, replace: true }
        );
    };

    return (
        <>
            <Head title="Master Data Guru Pembimbing - SIARISA" />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full bg-[#F6F7FA] min-h-screen">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#181A20] text-white">
                                <FontAwesomeIcon icon={faChalkboardUser} className="size-4" />
                            </div>
                            <h1 className="text-2xl font-black tracking-tight text-[#181A20]">
                                Guru Pembimbing Sekolah
                            </h1>
                        </div>
                        <p className="mt-1 text-sm font-medium text-[#5A6272]">
                            Kelola data bapak/ibu guru pembimbing penempatan PKL dan monitoring siswa.
                        </p>
                    </div>

                    {isAdmin && (
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#181A20] px-4 py-2.5 text-xs md:text-sm font-extrabold text-[#D2F442] hover:bg-[#202229] transition-all shadow-xs cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faPlus} className="size-3.5" />
                            <span>Tambah Guru</span>
                        </button>
                    )}
                </div>

                {/* Search Bar & Summary Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-[#181A20]/8 shadow-xs">
                    <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6272] size-3.5"
                        />
                        <Input
                            type="text"
                            placeholder="Cari nama guru, NIP, email, atau no. telepon..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 rounded-xl border-[#E9EBEF] bg-[#F6F7FA] text-xs font-semibold focus:border-[#181A20]"
                        />
                    </form>

                    <div className="flex items-center gap-2 text-xs font-bold text-[#5A6272]">
                        <span className="inline-flex size-2 rounded-full bg-[#D2F442]" />
                        Total: <strong>{teachers.total}</strong> Guru Pembimbing
                    </div>
                </div>

                {/* Table Data */}
                <div className="bg-white rounded-3xl border border-[#181A20]/8 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-[#181A20]/8 bg-[#F6F7FA]/70 text-[11px] font-black uppercase tracking-wider text-[#5A6272]">
                                    <th className="px-6 py-4">Nama Lengkap & NIP</th>
                                    <th className="px-6 py-4">Kontak (Email / WhatsApp)</th>
                                    <th className="px-6 py-4">Alamat Domisili</th>
                                    <th className="px-6 py-4 text-center">Bimbingan Aktif</th>
                                    {isAdmin && <th className="px-6 py-4 text-right">Aksi</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#181A20]/5 font-medium text-[#181A20]">
                                {teachers.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-[#5A6272]">
                                            Tidak ada data guru pembimbing ditemukan.
                                        </td>
                                    </tr>
                                ) : (
                                    teachers.data.map((teacher) => (
                                        <tr key={teacher.id} className="hover:bg-[#F6F7FA]/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#181A20] text-[#D2F442] font-black">
                                                        <FontAwesomeIcon icon={faChalkboardUser} className="size-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-sm text-[#181A20]">
                                                            {teacher.user.name}
                                                        </div>
                                                        <div className="flex items-center gap-1.5 text-[11px] text-[#5A6272] mt-0.5">
                                                            <FontAwesomeIcon icon={faIdCard} className="size-3 text-[#5A6272]" />
                                                            <span>NIP: {teacher.nip || '-'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1 text-xs">
                                                    <div className="flex items-center gap-2 text-[#181A20]">
                                                        <FontAwesomeIcon icon={faEnvelope} className="size-3 text-[#5A6272]" />
                                                        <span>{teacher.user.email}</span>
                                                    </div>
                                                    {teacher.phone && (
                                                        <div className="flex items-center gap-2 text-[#5A6272]">
                                                            <FontAwesomeIcon icon={faPhone} className="size-3 text-[#5A6272]" />
                                                            <span>{teacher.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-start gap-2 max-w-xs text-xs text-[#5A6272]">
                                                    <FontAwesomeIcon icon={faLocationDot} className="size-3 text-[#5A6272] mt-0.5 shrink-0" />
                                                    <span className="line-clamp-2">{teacher.address || 'Belum diisi'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#F0F2F5] text-[#181A20]">
                                                    <FontAwesomeIcon icon={faBriefcase} className="size-3 text-[#5A6272]" />
                                                    {teacher.supervisor_assignments_count ?? 0} Kelompok
                                                </span>
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(teacher)}
                                                            className="flex size-8 items-center justify-center rounded-lg border border-[#E9EBEF] text-[#5A6272] hover:bg-[#181A20] hover:text-[#D2F442] transition-colors cursor-pointer"
                                                            title="Edit Data Guru"
                                                        >
                                                            <FontAwesomeIcon icon={faPenToSquare} className="size-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(teacher)}
                                                            className="flex size-8 items-center justify-center rounded-lg border border-[#E9EBEF] text-[#5A6272] hover:bg-[#FF6B4A] hover:text-white transition-colors cursor-pointer"
                                                            title="Hapus Data Guru"
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
                    {teachers.last_page > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-[#181A20]/8 bg-[#F6F7FA]/50 text-xs">
                            <span className="text-[#5A6272] font-semibold">
                                Menampilkan {teachers.from ?? 0} - {teachers.to ?? 0} dari {teachers.total} data
                            </span>
                            <div className="flex items-center gap-1">
                                {teachers.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                                            link.active
                                                ? 'bg-[#181A20] text-[#D2F442]'
                                                : link.url
                                                ? 'text-[#5A6272] hover:bg-white hover:text-[#181A20]'
                                                : 'text-[#5A6272]/40 cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL TAMBAH / EDIT GURU */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-lg rounded-3xl bg-white p-6 border border-[#181A20]/10 shadow-2xl">
                    <DialogHeader>
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-[#181A20] text-[#D2F442] mb-2 font-black">
                            <FontAwesomeIcon icon={faUserCheck} className="size-4" />
                        </div>
                        <DialogTitle className="text-xl font-black text-[#181A20]">
                            {editingTeacher ? 'Edit Data Guru Pembimbing' : 'Tambah Guru Pembimbing Baru'}
                        </DialogTitle>
                        <DialogDescription className="text-xs font-medium text-[#5A6272]">
                            Akun login guru akan dibuat secara otomatis dengan role Guru Pembimbing.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2">
                                <Label htmlFor="teacher_name" className="text-xs font-bold text-[#181A20]">
                                    Nama Lengkap Beserta Gelar <span className="text-[#FF6B4A]">*</span>
                                </Label>
                                <Input
                                    id="teacher_name"
                                    type="text"
                                    placeholder="Contoh: Budi Santoso, S.Kom."
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className="mt-1.5 rounded-xl border-[#E9EBEF] text-xs font-semibold focus:border-[#181A20]"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-xs text-[#FF6B4A] font-bold">{errors.name}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="teacher_email" className="text-xs font-bold text-[#181A20]">
                                    Email Akun Login <span className="text-[#FF6B4A]">*</span>
                                </Label>
                                <Input
                                    id="teacher_email"
                                    type="email"
                                    placeholder="nama@siarisa.sch.id"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="mt-1.5 rounded-xl border-[#E9EBEF] text-xs font-semibold focus:border-[#181A20]"
                                    required
                                />
                                {errors.email && (
                                    <p className="mt-1 text-xs text-[#FF6B4A] font-bold">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="teacher_password" className="text-xs font-bold text-[#181A20]">
                                    Password {editingTeacher && <span className="text-[#5A6272] font-normal">(opsional)</span>}
                                </Label>
                                <Input
                                    id="teacher_password"
                                    type="password"
                                    placeholder={editingTeacher ? 'Kosongkan jika tidak diganti' : 'Minimal 8 karakter (default: password)'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="mt-1.5 rounded-xl border-[#E9EBEF] text-xs font-semibold focus:border-[#181A20]"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-xs text-[#FF6B4A] font-bold">{errors.password}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="teacher_nip" className="text-xs font-bold text-[#181A20]">
                                    NIP / No. Identitas Guru
                                </Label>
                                <Input
                                    id="teacher_nip"
                                    type="text"
                                    placeholder="Contoh: 19880123 201101 1 002"
                                    value={data.nip}
                                    onChange={(e) => setData('nip', e.target.value)}
                                    className="mt-1.5 rounded-xl border-[#E9EBEF] text-xs font-semibold focus:border-[#181A20]"
                                />
                                {errors.nip && (
                                    <p className="mt-1 text-xs text-[#FF6B4A] font-bold">{errors.nip}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="teacher_phone" className="text-xs font-bold text-[#181A20]">
                                    No. WhatsApp / Telepon
                                </Label>
                                <Input
                                    id="teacher_phone"
                                    type="text"
                                    placeholder="Contoh: 08123456789"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="mt-1.5 rounded-xl border-[#E9EBEF] text-xs font-semibold focus:border-[#181A20]"
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-xs text-[#FF6B4A] font-bold">{errors.phone}</p>
                                )}
                            </div>

                            <div className="sm:col-span-2">
                                <Label htmlFor="teacher_address" className="text-xs font-bold text-[#181A20]">
                                    Alamat Domisili
                                </Label>
                                <Input
                                    id="teacher_address"
                                    type="text"
                                    placeholder="Alamat domisili guru..."
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    className="mt-1.5 rounded-xl border-[#E9EBEF] text-xs font-semibold focus:border-[#181A20]"
                                />
                                {errors.address && (
                                    <p className="mt-1 text-xs text-[#FF6B4A] font-bold">{errors.address}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter className="pt-4 gap-2 sm:gap-0">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-xl border border-[#E9EBEF] px-4 py-2 text-xs font-bold text-[#5A6272] hover:bg-[#F6F7FA] transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-[#181A20] px-4 py-2 text-xs font-extrabold text-[#D2F442] hover:bg-[#202229] transition-colors cursor-pointer"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Data Guru'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

