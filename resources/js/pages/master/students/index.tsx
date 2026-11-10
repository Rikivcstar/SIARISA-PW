import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    faCheck,
    faCheckCircle,
    faCircleExclamation,
    faEnvelope,
    faFilter,
    faGraduationCap,
    faIdCard,
    faLocationDot,
    faMagnifyingGlass,
    faPenToSquare,
    faPhone,
    faPlus,
    faRotateRight,
    faTrash,
    faUserGraduate,
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

interface MajorData {
    id: number;
    name: string;
    code: string;
}

interface AcademicYearData {
    id: number;
    name: string;
}

interface ClassroomData {
    id: number;
    name: string;
    major_id: number;
    academic_year_id: number;
    academic_year?: AcademicYearData;
}

interface StudentItem {
    id: number;
    user_id: number;
    nis: string;
    nisn: string | null;
    classroom_id: number | null;
    major_id: number;
    status: 'active' | 'inactive' | 'graduated';
    phone: string | null;
    address: string | null;
    user: UserData;
    major: MajorData;
    classroom: ClassroomData | null;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedStudents {
    data: StudentItem[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

interface Props {
    students: PaginatedStudents;
    majors: MajorData[];
    classrooms: ClassroomData[];
    filters: {
        search: string;
        major_id: string | number;
        classroom_id: string | number;
        status: string;
    };
}

export default function MasterStudents({
    students,
    majors = [],
    classrooms = [],
    filters,
}: Props) {
    const { flash, auth } = usePage().props as {
        flash?: { success?: string; error?: string };
        auth: { user: { roles?: string[] } };
    };

    const isAdmin = auth.user.roles?.includes('admin');
    const alert = useSiarisaAlert();

    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedMajor, setSelectedMajor] = useState(String(filters.major_id || ''));
    const [selectedClassroom, setSelectedClassroom] = useState(String(filters.classroom_id || ''));
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        nis: '',
        nisn: '',
        major_id: majors[0]?.id ? String(majors[0].id) : '',
        classroom_id: '',
        status: 'active',
        phone: '',
        address: '',
    });

    const openCreateModal = () => {
        setEditingStudent(null);
        reset();
        clearErrors();
        setData({
            name: '',
            email: '',
            password: '',
            nis: '',
            nisn: '',
            major_id: majors[0]?.id ? String(majors[0].id) : '',
            classroom_id: '',
            status: 'active',
            phone: '',
            address: '',
        });
        setIsModalOpen(true);
    };

    const openEditModal = (student: StudentItem) => {
        setEditingStudent(student);
        clearErrors();
        setData({
            name: student.user.name,
            email: student.user.email,
            password: '',
            nis: student.nis,
            nisn: student.nisn || '',
            major_id: String(student.major_id),
            classroom_id: student.classroom_id ? String(student.classroom_id) : '',
            status: student.status,
            phone: student.phone || '',
            address: student.address || '',
        });
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingStudent) {
            put(`/master/students/${editingStudent.id}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    setEditingStudent(null);
                },
            });
        } else {
            post('/master/students', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
            });
        }
    };

    const handleDelete = (student: StudentItem) => {
        alert.deleteConfirm(
            'Hapus Data Siswa?',
            `Apakah Anda yakin ingin menghapus data siswa "${student.user.name}" (NIS: ${student.nis})? Akun portal siswa juga akan dihapus permanen.`,
            () => {
                router.delete(`/master/students/${student.id}`);
            },
        );
    };

    const handleFilterSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get(
            '/master/students',
            {
                search: searchQuery,
                major_id: selectedMajor,
                classroom_id: selectedClassroom,
                status: selectedStatus,
            },
            { preserveState: true, replace: true }
        );
    };

    const handleResetFilters = () => {
        setSearchQuery('');
        setSelectedMajor('');
        setSelectedClassroom('');
        setSelectedStatus('');
        router.get('/master/students', {}, { preserveState: true, replace: true });
    };

    // Filter available classrooms inside modal based on selected major
    const modalFilteredClassrooms = classrooms.filter((cls) => {
        if (!data.major_id) return true;
        return String(cls.major_id) === String(data.major_id);
    });

    return (
        <>
            <Head title="Master Data Siswa - SIARISA" />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full bg-[#F6F7FA] min-h-screen">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#181A20] text-white">
                                <FontAwesomeIcon icon={faUserGraduate} className="size-4" />
                            </div>
                            <h1 className="text-2xl font-black tracking-tight text-[#181A20]">
                                Data Siswa PKL
                            </h1>
                        </div>
                        <p className="mt-1 text-sm font-medium text-[#5A6272]">
                            Kelola data pokok siswa SMK IT Ar-Risalah, pemetaan kelas rombel, dan akun portal.
                        </p>
                    </div>

                    {isAdmin && (
                        <button
                            type="button"
                            onClick={openCreateModal}
                            className="inline-flex items-center gap-2 rounded-2xl bg-[#181A20] px-4 py-2.5 text-xs md:text-sm font-extrabold text-[#D2F442] hover:bg-[#202229] transition-all shadow-xs cursor-pointer"
                        >
                            <FontAwesomeIcon icon={faPlus} className="size-3.5" />
                            <span>Tambah Siswa</span>
                        </button>
                    )}
                </div>

                {/* Filter and Search Bar */}
                <div className="bg-white rounded-3xl p-5 border border-[#181A20]/8 shadow-xs space-y-4">
                    <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="lg:col-span-2 relative">
                            <FontAwesomeIcon
                                icon={faMagnifyingGlass}
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A6272] size-3.5"
                            />
                            <Input
                                type="text"
                                placeholder="Cari nama, NIS, NISN, atau kontak siswa..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 rounded-xl border-[#E9EBEF] bg-[#F6F7FA] text-xs font-semibold focus:border-[#181A20]"
                            />
                        </div>

                        <div>
                            <select
                                value={selectedMajor}
                                onChange={(e) => setSelectedMajor(e.target.value)}
                                className="w-full rounded-xl border border-[#E9EBEF] bg-[#F6F7FA] px-3 py-2 text-xs font-semibold text-[#181A20] focus:border-[#181A20] focus:ring-0 cursor-pointer"
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
                                className="w-full rounded-xl border border-[#E9EBEF] bg-[#F6F7FA] px-3 py-2 text-xs font-semibold text-[#181A20] focus:border-[#181A20] focus:ring-0 cursor-pointer"
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
                                value={selectedStatus}
                                onChange={(e) => setSelectedStatus(e.target.value)}
                                className="w-full rounded-xl border border-[#E9EBEF] bg-[#F6F7FA] px-3 py-2 text-xs font-semibold text-[#181A20] focus:border-[#181A20] focus:ring-0 cursor-pointer"
                            >
                                <option value="">Semua Status</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Nonaktif</option>
                                <option value="graduated">Lulus</option>
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
                                className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#E9EBEF] text-[#5A6272] hover:bg-[#F6F7FA] transition-colors cursor-pointer"
                                title="Reset Filter"
                            >
                                <FontAwesomeIcon icon={faRotateRight} className="size-3.5" />
                            </button>
                        </div>
                    </form>

                    <div className="flex items-center justify-between text-xs text-[#5A6272] pt-1 border-t border-[#181A20]/5">
                        <div className="flex items-center gap-2 font-semibold">
                            <span>Ditemukan:</span>
                            <span className="font-extrabold text-[#181A20]">{students.total}</span>
                            <span>Siswa</span>
                        </div>
                    </div>
                </div>

                {/* Table Data */}
                <div className="bg-white rounded-3xl border border-[#181A20]/8 shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-[#181A20]/8 bg-[#F6F7FA]/70 text-[11px] font-black uppercase tracking-wider text-[#5A6272]">
                                    <th className="px-6 py-4">Nama Siswa & NIS</th>
                                    <th className="px-6 py-4">Kelas & Jurusan</th>
                                    <th className="px-6 py-4">Kontak Siswa</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    {isAdmin && <th className="px-6 py-4 text-right">Aksi</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#181A20]/5 font-medium text-[#181A20]">
                                {students.data.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-[#5A6272]">
                                            Tidak ada data siswa ditemukan sesuai kriteria pencarian.
                                        </td>
                                    </tr>
                                ) : (
                                    students.data.map((student) => (
                                        <tr key={student.id} className="hover:bg-[#F6F7FA]/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-[#181A20] text-[#D2F442] font-black">
                                                        <FontAwesomeIcon icon={faUserGraduate} className="size-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-extrabold text-sm text-[#181A20]">
                                                            {student.user.name}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[11px] text-[#5A6272] mt-0.5">
                                                            <span className="font-bold text-[#181A20]">NIS: {student.nis}</span>
                                                            {student.nisn && (
                                                                <>
                                                                    <span>•</span>
                                                                    <span>NISN: {student.nisn}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="font-extrabold text-xs text-[#181A20]">
                                                        {student.classroom?.name || 'Belum Ada Rombel'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black bg-[#D2F442] text-[#181A20]">
                                                            {student.major?.code}
                                                        </span>
                                                        <span className="text-[11px] text-[#5A6272] font-medium">
                                                            {student.major?.name}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1 text-xs">
                                                    <div className="flex items-center gap-2 text-[#181A20]">
                                                        <FontAwesomeIcon icon={faEnvelope} className="size-3 text-[#5A6272]" />
                                                        <span>{student.user.email}</span>
                                                    </div>
                                                    {student.phone && (
                                                        <div className="flex items-center gap-2 text-[#5A6272]">
                                                            <FontAwesomeIcon icon={faPhone} className="size-3 text-[#5A6272]" />
                                                            <span>{student.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {student.status === 'active' && (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black bg-[#D2F442] text-[#181A20] shadow-2xs">
                                                        <FontAwesomeIcon icon={faCheck} className="size-3" />
                                                        Aktif
                                                    </span>
                                                )}
                                                {student.status === 'inactive' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#E9EBEF] text-[#5A6272]">
                                                        Nonaktif
                                                    </span>
                                                )}
                                                {student.status === 'graduated' && (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#181A20] text-white">
                                                        Lulus
                                                    </span>
                                                )}
                                            </td>
                                            {isAdmin && (
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditModal(student)}
                                                            className="flex size-8 items-center justify-center rounded-lg border border-[#E9EBEF] text-[#5A6272] hover:bg-[#181A20] hover:text-[#D2F442] transition-colors cursor-pointer"
                                                            title="Edit Data Siswa"
                                                        >
                                                            <FontAwesomeIcon icon={faPenToSquare} className="size-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(student)}
                                                            className="flex size-8 items-center justify-center rounded-lg border border-[#E9EBEF] text-[#5A6272] hover:bg-[#FF6B4A] hover:text-white transition-colors cursor-pointer"
                                                            title="Hapus Data Siswa"
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
                    {students.last_page > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-[#181A20]/8 bg-[#F6F7FA]/50 text-xs">
                            <span className="text-[#5A6272] font-semibold">
                                Menampilkan {students.from ?? 0} - {students.to ?? 0} dari {students.total} siswa
                            </span>
                            <div className="flex items-center gap-1">
                                {students.links.map((link, idx) => (
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

            {/* MODAL TAMBAH / EDIT SISWA */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-xl rounded-3xl bg-white p-6 border border-[#181A20]/10 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-[#181A20] text-[#D2F442] mb-2 font-black">
                            <FontAwesomeIcon icon={faUserGraduate} className="size-4" />
                        </div>
                        <DialogTitle className="text-xl font-black text-[#181A20]">
                            {editingStudent ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
                        </DialogTitle>
                        <DialogDescription className="text-xs font-medium text-[#5A6272]">
                            Akun portal siswa dibuat otomatis dengan role Siswa.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="sm:col-span-2">
                                <Label htmlFor="student_name" className="text-xs font-bold text-[#181A20]">
                                    Nama Lengkap Siswa <span className="text-[#FF6B4A]">*</span>
                                </Label>
                                <Input
                                    id="student_name"
                                    type="text"
                                    placeholder="Contoh: Muhammad Farhan"
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
                                <Label htmlFor="student_email" className="text-xs font-bold text-[#181A20]">
                                    Email Akun Siswa <span className="text-[#FF6B4A]">*</span>
                                </Label>
                                <Input
                                    id="student_email"
                                    type="email"
                                    placeholder="farhan@siswa.siarisa.sch.id"
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
                                <Label htmlFor="student_password" className="text-xs font-bold text-[#181A20]">
                                    Password {editingStudent && <span className="text-[#5A6272] font-normal">(opsional)</span>}
                                </Label>
                                <Input
                                    id="student_password"
                                    type="password"
                                    placeholder={editingStudent ? 'Kosongkan jika tidak diganti' : 'Minimal 8 karakter (default: password)'}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="mt-1.5 rounded-xl border-[#E9EBEF] text-xs font-semibold focus:border-[#181A20]"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-xs text-[#FF6B4A] font-bold">{errors.password}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="student_nis" className="text-xs font-bold text-[#181A20]">
                                    NIS (Nomor Induk Siswa) <span className="text-[#FF6B4A]">*</span>
                                </Label>
                                <Input
                                    id="student_nis"
                                    type="text"
                                    placeholder="Contoh: 242510001"
                                    value={data.nis}
                                    onChange={(e) => setData('nis', e.target.value)}
                                    className="mt-1.5 rounded-xl border-[#E9EBEF] text-xs font-semibold focus:border-[#181A20]"
                                    required
                                />
                                {errors.nis && (
                                    <p className="mt-1 text-xs text-[#FF6B4A] font-bold">{errors.nis}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="student_nisn" className="text-xs font-bold text-[#181A20]">
                                    NISN (Nasional)
                                </Label>
                                <Input
                                    id="student_nisn"
                                    type="text"
                                    placeholder="Contoh: 0071234567"
                                    value={data.nisn}
                                    onChange={(e) => setData('nisn', e.target.value)}
                                    className="mt-1.5 rounded-xl border-[#E9EBEF] text-xs font-semibold focus:border-[#181A20]"
                                />
                                {errors.nisn && (
                                    <p className="mt-1 text-xs text-[#FF6B4A] font-bold">{errors.nisn}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="student_major_id" className="text-xs font-bold text-[#181A20]">
                                    Program Keahlian / Jurusan <span className="text-[#FF6B4A]">*</span>
                                </Label>
                                <select
                                    id="student_major_id"
                                    value={data.major_id}
                                    onChange={(e) => setData('major_id', e.target.value)}
                                    className="mt-1.5 w-full rounded-xl border border-[#E9EBEF] bg-white px-3 py-2 text-xs font-semibold text-[#181A20] focus:border-[#181A20] focus:ring-0"
                                    required
                                >
                                    {majors.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.code} - {m.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.major_id && (
                                    <p className="mt-1 text-xs text-[#FF6B4A] font-bold">{errors.major_id}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="student_classroom_id" className="text-xs font-bold text-[#181A20]">
                                    Rombongan Belajar / Kelas
                                </Label>
                                <select
                                    id="student_classroom_id"
                                    value={data.classroom_id}
                                    onChange={(e) => setData('classroom_id', e.target.value)}
                                    className="mt-1.5 w-full rounded-xl border border-[#E9EBEF] bg-white px-3 py-2 text-xs font-semibold text-[#181A20] focus:border-[#181A20] focus:ring-0"
                                >
                                    <option value="">-- Pilih Kelas --</option>
                                    {modalFilteredClassrooms.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.classroom_id && (
                                    <p className="mt-1 text-xs text-[#FF6B4A] font-bold">{errors.classroom_id}</p>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="student_status" className="text-xs font-bold text-[#181A20]">
                                    Status Siswa <span className="text-[#FF6B4A]">*</span>
                                </Label>
                                <select
                                    id="student_status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    className="mt-1.5 w-full rounded-xl border border-[#E9EBEF] bg-white px-3 py-2 text-xs font-semibold text-[#181A20] focus:border-[#181A20] focus:ring-0"
                                    required
                                >
                                    <option value="active">Aktif</option>
                                    <option value="inactive">Nonaktif</option>
                                    <option value="graduated">Lulus</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="student_phone" className="text-xs font-bold text-[#181A20]">
                                    No. WhatsApp / Telepon
                                </Label>
                                <Input
                                    id="student_phone"
                                    type="text"
                                    placeholder="Contoh: 085812345678"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    className="mt-1.5 rounded-xl border-[#E9EBEF] text-xs font-semibold focus:border-[#181A20]"
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-xs text-[#FF6B4A] font-bold">{errors.phone}</p>
                                )}
                            </div>

                            <div className="sm:col-span-2">
                                <Label htmlFor="student_address" className="text-xs font-bold text-[#181A20]">
                                    Alamat Domisili Siswa
                                </Label>
                                <Input
                                    id="student_address"
                                    type="text"
                                    placeholder="Contoh: Kp. Babakan, Desa Cariu, Kec. Cariu, Bogor"
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
                                {processing ? 'Menyimpan...' : 'Simpan Data Siswa'}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

