import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    faBuilding,
    faEnvelope,
    faLocationDot,
    faMagnifyingGlass,
    faPenToSquare,
    faPhone,
    faPlus,
    faTrash,
    faUser,
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
interface IndustryItem {
    id: number;
    name: string;
    address: string;
    city: string | null;
    phone: string | null;
    email: string | null;
    contact_person: string | null;
    contact_phone: string | null;
    is_active: boolean;
    pkl_applications_count?: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedIndustries {
    data: IndustryItem[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface Props {
    industries: PaginatedIndustries;
    filters: {
        search: string;
        status: string;
    };
}

export default function MasterIndustries({ industries, filters }: Props) {
    const { flash, auth } = usePage().props as {
        flash?: { success?: string; error?: string };
        auth: { user: { roles?: string[] } };
    };

    const isAdmin = auth.user.roles?.includes('admin');
    const alert = useSiarisaAlert();

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingIndustry, setEditingIndustry] = useState<IndustryItem | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        address: '',
        city: '',
        phone: '',
        email: '',
        contact_person: '',
        contact_phone: '',
        is_active: true,
    });

    const openCreateModal = () => {
        setEditingIndustry(null);
        reset();
        clearErrors();
        setData({
            name: '',
            address: '',
            city: '',
            phone: '',
            email: '',
            contact_person: '',
            contact_phone: '',
            is_active: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (industry: IndustryItem) => {
        setEditingIndustry(industry);
        clearErrors();
        setData({
            name: industry.name,
            address: industry.address,
            city: industry.city || '',
            phone: industry.phone || '',
            email: industry.email || '',
            contact_person: industry.contact_person || '',
            contact_phone: industry.contact_phone || '',
            is_active: Boolean(industry.is_active),
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingIndustry) {
            put(`/master/industries/${editingIndustry.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        } else {
            post('/master/industries', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (industry: IndustryItem) => {
        alert.deleteConfirm(
            'Hapus Data DUDI?',
            `Apakah Anda yakin ingin menghapus mitra "${industry.name}"? Data tidak dapat dikembalikan.`,
            () => {
                router.delete(`/master/industries/${industry.id}`, {
                    onSuccess: () => {
                        alert.success('Berhasil Dihapus!', `Data mitra "${industry.name}" telah dihapus.`);
                    },
                });
            },
        );
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/master/industries',
            { search: searchQuery, status: filters.status },
            { preserveState: true, replace: true }
        );
    };

    const handleStatusFilter = (status: string) => {
        router.get(
            '/master/industries',
            { search: searchQuery, status },
            { preserveState: true, replace: true }
        );
    };

    return (
        <>
            <Head title="Master DUDI / Industri Mitra - SIARISA" />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full bg-[#F6F7FA] min-h-screen">
                {/* Flash messages are shown via SiarisaAlert in useEffect */}

                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#181A20] text-white">
                                <FontAwesomeIcon icon={faBuilding} className="size-4" />
                            </div>
                            <h1 className="text-2xl font-black tracking-tight text-[#181A20]">
                                DUDI / Industri Mitra
                            </h1>
                        </div>
                        <p className="text-xs md:text-sm text-[#5A6272] mt-1.5">
                            Kelola data perusahaan mitra tempat Praktik Kerja Lapangan (PKL) siswa.
                        </p>
                    </div>

                    {isAdmin && (
                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#181A20] hover:bg-black px-5 py-3 text-sm font-extrabold text-white shadow-xs transition-colors cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faPlus} className="text-[#D2F442]" />
                            <span>Tambah Industri Mitra</span>
                        </button>
                    )}
                </div>

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white border border-[#E9EBEF] p-3 rounded-2xl shadow-xs">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 bg-[#F6F7FA] p-1 rounded-xl">
                        <button
                            onClick={() => handleStatusFilter('all')}
                            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                filters.status === 'all' || !filters.status
                                    ? 'bg-[#181A20] text-white shadow-xs'
                                    : 'text-[#5A6272] hover:text-[#181A20]'
                            }`}
                        >
                            Semua ({industries.total})
                        </button>
                        <button
                            onClick={() => handleStatusFilter('active')}
                            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                filters.status === 'active'
                                    ? 'bg-[#181A20] text-white shadow-xs'
                                    : 'text-[#5A6272] hover:text-[#181A20]'
                            }`}
                        >
                            Aktif
                        </button>
                        <button
                            onClick={() => handleStatusFilter('inactive')}
                            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                filters.status === 'inactive'
                                    ? 'bg-[#FF6B4A] text-white shadow-xs'
                                    : 'text-[#5A6272] hover:text-[#181A20]'
                            }`}
                        >
                            Non-Aktif
                        </button>
                    </div>

                    {/* Search Input */}
                    <form onSubmit={handleSearch} className="relative flex-1 sm:max-w-xs">
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-[#5A6272]"
                        />
                        <Input
                            type="text"
                            placeholder="Cari nama, kota, atau PIC..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 text-xs h-9 rounded-xl border-[#E9EBEF] bg-[#F6F7FA]"
                        />
                    </form>
                </div>

                {/* Data Table (Eduplex Clean Style) */}
                <div className="rounded-3xl border border-[#E9EBEF] bg-white shadow-xs overflow-hidden">
                    {industries.data.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-[#F6F7FA] text-[#5A6272] mb-3">
                                <FontAwesomeIcon icon={faBuilding} className="size-5" />
                            </div>
                            <p className="text-sm font-bold text-[#181A20]">
                                Data DUDI Tidak Ditemukan
                            </p>
                            <p className="text-xs text-[#5A6272] mt-1 max-w-sm mx-auto">
                                Belum ada data industri yang sesuai dengan kriteria pencarian Anda.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-[#F6F7FA] text-xs font-bold text-[#5A6272] uppercase tracking-wider border-b border-[#E9EBEF]">
                                    <tr>
                                        <th className="px-6 py-4">Perusahaan & Alamat</th>
                                        <th className="px-6 py-4">Kota</th>
                                        <th className="px-6 py-4">Kontak / PIC</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-center">Siswa PKL</th>
                                        {isAdmin && (
                                            <th className="px-6 py-4 text-right">Aksi</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#E9EBEF]">
                                    {industries.data.map((item) => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-[#F6F7FA]/60 transition-colors"
                                        >
                                            <td className="px-6 py-4 max-w-xs">
                                                <div className="font-extrabold text-[#181A20]">
                                                    {item.name}
                                                </div>
                                                <div className="text-xs text-[#5A6272] flex items-start gap-1.5 mt-1 line-clamp-2">
                                                    <FontAwesomeIcon icon={faLocationDot} className="size-3 shrink-0 mt-0.5 text-[#5A6272]" />
                                                    <span>{item.address}</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-xs font-bold bg-[#F6F7FA] text-[#181A20] px-3 py-1 rounded-lg">
                                                    {item.city || '-'}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-xs">
                                                {item.contact_person ? (
                                                    <div className="flex items-center gap-1.5 font-bold text-[#181A20]">
                                                        <FontAwesomeIcon icon={faUser} className="size-3 text-[#5A6272]" />
                                                        <span>{item.contact_person}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-[#5A6272]">-</span>
                                                )}

                                                {item.contact_phone && (
                                                    <div className="flex items-center gap-1.5 text-[#5A6272] mt-0.5 font-medium">
                                                        <FontAwesomeIcon icon={faPhone} className="size-2.5 text-[#5A6272]" />
                                                        <span>{item.contact_phone}</span>
                                                    </div>
                                                )}

                                                {item.email && (
                                                    <div className="flex items-center gap-1.5 text-[#5A6272] mt-0.5 font-medium">
                                                        <FontAwesomeIcon icon={faEnvelope} className="size-2.5 text-[#5A6272]" />
                                                        <span>{item.email}</span>
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                {item.is_active ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D2F442]/30 px-3 py-1 text-xs font-bold text-[#181A20] border border-[#D2F442]">
                                                        <span className="size-1.5 rounded-full bg-[#181A20]" />
                                                        Aktif
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FF6B4A]/15 px-3 py-1 text-xs font-bold text-[#FF6B4A] border border-[#FF6B4A]/30">
                                                        <span className="size-1.5 rounded-full bg-[#FF6B4A]" />
                                                        Non-Aktif
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4 text-center whitespace-nowrap">
                                                <span className="rounded-full bg-[#F6F7FA] px-3 py-1 text-xs font-black text-[#181A20]">
                                                    {item.pkl_applications_count ?? 0}
                                                </span>
                                            </td>

                                            {isAdmin && (
                                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                                    <div className="inline-flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => openEditModal(item)}
                                                            className="flex size-8 items-center justify-center rounded-xl text-[#5A6272] hover:bg-[#F6F7FA] hover:text-[#181A20] transition-colors cursor-pointer"
                                                            title="Edit Data"
                                                        >
                                                            <FontAwesomeIcon icon={faPenToSquare} className="size-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(item)}
                                                            className="flex size-8 items-center justify-center rounded-xl text-[#5A6272] hover:bg-[#FF6B4A]/10 hover:text-[#FF6B4A] transition-colors cursor-pointer"
                                                            title="Hapus Data"
                                                        >
                                                            <FontAwesomeIcon icon={faTrash} className="size-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {industries.last_page > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E9EBEF] p-5">
                            <span className="text-xs text-[#5A6272]">
                                Menampilkan {industries.from ?? 0} - {industries.to ?? 0} dari {industries.total} mitra
                            </span>
                            <div className="flex items-center gap-1">
                                {industries.links.map((link, i) => (
                                    <button
                                        key={i}
                                        disabled={!link.url}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                                            link.active
                                                ? 'bg-[#181A20] text-white shadow-xs'
                                                : 'text-[#5A6272] hover:bg-[#F6F7FA] disabled:opacity-30 disabled:cursor-not-allowed'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Dialog Form Tambah / Edit DUDI */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-xl rounded-3xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-black text-[#181A20] flex items-center gap-2.5">
                            <div className="flex size-8 items-center justify-center rounded-xl bg-[#181A20] text-white">
                                <FontAwesomeIcon icon={faBuilding} className="size-3.5" />
                            </div>
                            <span>{editingIndustry ? 'Edit Data DUDI Mitra' : 'Tambah DUDI Mitra Baru'}</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-[#5A6272]">
                            Isi detail informasi perusahaan tempat pelaksanaan Praktik Kerja Lapangan siswa.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 py-2">
                        {/* Nama Perusahaan */}
                        <div>
                            <Label htmlFor="name" className="text-xs font-bold text-[#181A20]">
                                Nama Perusahaan / Instansi <span className="text-[#FF6B4A]">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="Contoh: PT Telkom Indonesia, Studio Desain XYZ"
                                className="mt-1 text-sm rounded-xl"
                                required
                            />
                            {errors.name && <p className="text-xs text-[#FF6B4A] mt-1">{errors.name}</p>}
                        </div>

                        {/* Alamat Lengkap */}
                        <div>
                            <Label htmlFor="address" className="text-xs font-bold text-[#181A20]">
                                Alamat Lengkap <span className="text-[#FF6B4A]">*</span>
                            </Label>
                            <textarea
                                id="address"
                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                rows={2}
                                placeholder="Jalan, RT/RW, Kelurahan, Kecamatan"
                                className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                required
                            />
                            {errors.address && <p className="text-xs text-[#FF6B4A] mt-1">{errors.address}</p>}
                        </div>

                        {/* Kota & Telepon */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="city" className="text-xs font-bold text-[#181A20]">
                                    Kota / Kabupaten
                                </Label>
                                <Input
                                    id="city"
                                    value={data.city}
                                    onChange={(e) => setData('city', e.target.value)}
                                    placeholder="Contoh: Bogor, Jakarta Timur"
                                    className="mt-1 text-sm rounded-xl"
                                />
                            </div>

                            <div>
                                <Label htmlFor="phone" className="text-xs font-bold text-[#181A20]">
                                    Telepon Kantor
                                </Label>
                                <Input
                                    id="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    placeholder="021-xxxxxxx"
                                    className="mt-1 text-sm rounded-xl"
                                />
                            </div>
                        </div>

                        {/* PIC & No HP */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="contact_person" className="text-xs font-bold text-[#181A20]">
                                    Kontak Person (PIC / HRD)
                                </Label>
                                <Input
                                    id="contact_person"
                                    value={data.contact_person}
                                    onChange={(e) => setData('contact_person', e.target.value)}
                                    placeholder="Nama PIC perusahaan"
                                    className="mt-1 text-sm rounded-xl"
                                />
                            </div>

                            <div>
                                <Label htmlFor="contact_phone" className="text-xs font-bold text-[#181A20]">
                                    No. HP / WhatsApp PIC
                                </Label>
                                <Input
                                    id="contact_phone"
                                    value={data.contact_phone}
                                    onChange={(e) => setData('contact_phone', e.target.value)}
                                    placeholder="08xxxxxxxxxx"
                                    className="mt-1 text-sm rounded-xl"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <Label htmlFor="email" className="text-xs font-bold text-[#181A20]">
                                Email Perusahaan
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="hrd@perusahaan.co.id"
                                className="mt-1 text-sm rounded-xl"
                            />
                        </div>

                        {/* Status Kerjasama */}
                        <div className="flex items-center gap-2 pt-1">
                            <input
                                id="is_active"
                                type="checkbox"
                                checked={data.is_active}
                                onChange={(e) => setData('is_active', e.target.checked)}
                                className="size-4 rounded border-gray-300 text-[#181A20] focus:ring-[#181A20] cursor-pointer"
                            />
                            <Label htmlFor="is_active" className="text-xs font-bold text-[#181A20] cursor-pointer">
                                Status Kerjasama Aktif (dapat dipilih siswa untuk penempatan PKL)
                            </Label>
                        </div>

                        <DialogFooter className="pt-3 gap-2 sm:gap-0">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-xl border border-[#E9EBEF] px-4 py-2 text-sm font-bold text-[#5A6272] hover:bg-[#F6F7FA] transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-xl bg-[#181A20] hover:bg-black px-5 py-2 text-sm font-extrabold text-white shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : editingIndustry ? 'Simpan Perubahan' : 'Tambah Mitra'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
