import { Head, router, useForm, usePage } from "@inertiajs/react";
import {
    faCalendarDays,
    faCheck,
    faCheckCircle,
    faCircleExclamation,
    faGraduationCap,
    faLayerGroup,
    faPenToSquare,
    faPlus,
    faSchool,
    faToggleOff,
    faToggleOn,
    faTrash,
    faUsers,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSiarisaAlert } from "@/components/siarisa-alert";

interface MajorItem {
    id: number;
    name: string;
    code: string;
}

interface AcademicYearItem {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    classrooms_count?: number;
}

interface ClassroomItem {
    id: number;
    academic_year_id: number;
    major_id: number;
    name: string;
    major?: MajorItem;
    academic_year?: AcademicYearItem;
    students_count?: number;
}

interface Props {
    academicYears: AcademicYearItem[];
    classrooms: ClassroomItem[];
    majors: MajorItem[];
    selectedYearId: number;
}

export default function MasterAcademicYears({
    academicYears = [],
    classrooms = [],
    majors = [],
    selectedYearId,
}: Props) {
    const { flash, auth } = usePage().props as {
        flash?: { success?: string; error?: string };
        auth: { user: { roles?: string[] } };
    };

    const isAdmin = auth.user.roles?.includes("admin");
    const alert = useSiarisaAlert();
    const [activeTab, setActiveTab] = useState<"years" | "classrooms">("years");

    // Modals state
    const [isYearModalOpen, setIsYearModalOpen] = useState(false);
    const [isClassModalOpen, setIsClassModalOpen] = useState(false);
    const [editingClassroom, setEditingClassroom] =
        useState<ClassroomItem | null>(null);

    // Form Tahun Ajaran
    const yearForm = useForm({
        name: "",
        start_date: "",
        end_date: "",
        is_active: false,
    });

    // Form Kelas
    const classForm = useForm({
        academic_year_id: selectedYearId || (academicYears[0]?.id ?? ""),
        major_id: majors[0]?.id ?? "",
        name: "",
    });

    const handleOpenCreateYear = () => {
        yearForm.reset();
        yearForm.clearErrors();
        yearForm.setData({
            name: "",
            start_date: "",
            end_date: "",
            is_active: academicYears.length === 0,
        });
        setIsYearModalOpen(true);
    };

    const handleYearSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        yearForm.post("/master/academic-years", {
            onSuccess: () => {
                setIsYearModalOpen(false);
                yearForm.reset();
            },
        });
    };

    const handleToggleActiveYear = (year: AcademicYearItem) => {
        if (year.is_active) return; // already active
        alert.confirm(
            "Aktifkan Tahun Ajaran?",
            `Jadikan tahun ajaran "${year.name}" sebagai periode aktif berjalan? Periode tahun ajaran lain akan otomatis dinonaktifkan.`,
            () => {
                router.post(
                    `/master/academic-years/${year.id}/toggle-active`,
                    {},
                    {
                        preserveScroll: true,
                    },
                );
            },
        );
    };

    const handleOpenCreateClass = () => {
        setEditingClassroom(null);
        classForm.reset();
        classForm.clearErrors();
        classForm.setData({
            academic_year_id: selectedYearId || (academicYears[0]?.id ?? ""),
            major_id: majors[0]?.id ?? "",
            name: "",
        });
        setIsClassModalOpen(true);
    };

    const handleOpenEditClass = (classroom: ClassroomItem) => {
        setEditingClassroom(classroom);
        classForm.clearErrors();
        classForm.setData({
            academic_year_id: classroom.academic_year_id,
            major_id: classroom.major_id,
            name: classroom.name,
        });
        setIsClassModalOpen(true);
    };

    const handleClassSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingClassroom) {
            classForm.put(`/master/classrooms/${editingClassroom.id}`, {
                onSuccess: () => {
                    setIsClassModalOpen(false);
                    setEditingClassroom(null);
                },
            });
        } else {
            classForm.post("/master/classrooms", {
                onSuccess: () => {
                    setIsClassModalOpen(false);
                    classForm.reset();
                },
            });
        }
    };

    const handleDeleteClassroom = (classroom: ClassroomItem) => {
        alert.deleteConfirm(
            "Hapus Data Kelas?",
            `Apakah Anda yakin ingin menghapus rombel "${classroom.name}"? Tindakan ini tidak dapat dibatalkan jika terdapat siswa yang terhubung.`,
            () => {
                router.delete(`/master/classrooms/${classroom.id}`);
            },
        );
    };

    const handleFilterYear = (yearId: number) => {
        router.get(
            "/master/academic-years",
            { academic_year_id: yearId },
            { preserveState: true, replace: true },
        );
    };

    const activeYearObj = academicYears.find((y) => y.is_active);

    return (
        <>
            <Head title="Master Tahun Ajaran & Kelas - SIARISA" />

            <div className="flex flex-col gap-6 p-4 md:p-8 max-w-7xl mx-auto w-full bg-background min-h-screen">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#181A20] text-white">
                                <FontAwesomeIcon
                                    icon={faSchool}
                                    className="size-4"
                                />
                            </div>
                            <h1 className="text-2xl font-black tracking-tight text-foreground">
                                Tahun Ajaran & Rombel
                            </h1>
                        </div>
                        <p className="mt-1 text-sm font-medium text-muted-foreground">
                            Kelola periode akademik aktif dan struktur rombongan
                            belajar / kelas siswa.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {activeTab === "years" && isAdmin && (
                            <button
                                type="button"
                                onClick={handleOpenCreateYear}
                                className="flex items-center gap-2 rounded-2xl bg-[#181A20] px-4 py-2.5 text-xs md:text-sm font-extrabold text-[#D2F442] hover:bg-[#202229] transition-all shadow-xs cursor-pointer"
                            >
                                <FontAwesomeIcon
                                    icon={faPlus}
                                    className="size-3.5"
                                />
                                <span>Tambah Tahun Ajaran</span>
                            </button>
                        )}
                        {activeTab === "classrooms" && isAdmin && (
                            <button
                                type="button"
                                onClick={handleOpenCreateClass}
                                className="flex items-center gap-2 rounded-2xl bg-[#181A20] px-4 py-2.5 text-xs md:text-sm font-extrabold text-[#D2F442] hover:bg-[#202229] transition-all shadow-xs cursor-pointer"
                            >
                                <FontAwesomeIcon
                                    icon={faPlus}
                                    className="size-3.5"
                                />
                                <span>Tambah Kelas</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Tab Switcher & Active Year Highlight Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 flex items-center p-1.5 bg-card rounded-2xl border border-border shadow-xs">
                        <button
                            type="button"
                            onClick={() => setActiveTab("years")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${activeTab === "years"
                                    ? "bg-[#181A20] text-[#D2F442] shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <FontAwesomeIcon
                                icon={faCalendarDays}
                                className="size-3.5"
                            />
                            <span>Tahun Ajaran ({academicYears.length})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab("classrooms")}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${activeTab === "classrooms"
                                    ? "bg-[#181A20] text-[#D2F442] shadow-xs"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            <FontAwesomeIcon
                                icon={faLayerGroup}
                                className="size-3.5"
                            />
                            <span>Rombel & Kelas ({classrooms.length})</span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#181A20] text-white rounded-2xl shadow-xs">
                        <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-[#D2F442] text-foreground dark:text-[#181A20] font-black">
                                <FontAwesomeIcon
                                    icon={faSchool}
                                    className="size-4"
                                />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase font-black tracking-wider text-[#D2F442]">
                                    Tahun Ajaran Berjalan
                                </div>
                                <div className="text-sm font-black">
                                    {activeYearObj?.name || "Belum Ditentukan"}
                                </div>
                            </div>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-[#D2F442]/20 text-[#D2F442] border border-[#D2F442]/30">
                            <span className="size-1.5 rounded-full bg-[#D2F442] animate-pulse" />
                            AKTIF
                        </span>
                    </div>
                </div>

                {/* TAB 1: TAHUN AJARAN */}
                {activeTab === "years" && (
                    <div className="bg-card rounded-3xl border border-border shadow-xs overflow-hidden">
                        <div className="p-5 border-b border-border flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-extrabold text-foreground">
                                    Daftar Periode Tahun Ajaran
                                </h2>
                                <p className="text-xs text-muted-foreground font-medium">
                                    Mengatur tahun akademik aktif yang digunakan
                                    pada penempatan PKL dan PPDB.
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-border bg-background/70 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                                        <th className="px-6 py-4">
                                            Tahun Ajaran
                                        </th>
                                        <th className="px-6 py-4">
                                            Periode Tanggal
                                        </th>
                                        <th className="px-6 py-4 text-center">
                                            Jumlah Kelas
                                        </th>
                                        <th className="px-6 py-4 text-center">
                                            Status
                                        </th>
                                        {isAdmin && (
                                            <th className="px-6 py-4 text-right">
                                                Aksi
                                            </th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border font-medium text-foreground">
                                    {academicYears.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="px-6 py-12 text-center text-muted-foreground"
                                            >
                                                Belum ada data tahun ajaran.
                                                Klik tombol Tambah Tahun Ajaran
                                                di atas.
                                            </td>
                                        </tr>
                                    ) : (
                                        academicYears.map((year) => (
                                            <tr
                                                key={year.id}
                                                className="hover:bg-background/50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className={`flex size-9 items-center justify-center rounded-xl font-bold ${year.is_active
                                                                    ? "bg-[#D2F442] text-foreground dark:text-[#181A20]"
                                                                    : "bg-background text-muted-foreground"
                                                                }`}
                                                        >
                                                            <FontAwesomeIcon
                                                                icon={
                                                                    faCalendarDays
                                                                }
                                                                className="size-4"
                                                            />
                                                        </div>
                                                        <div>
                                                            <div className="font-extrabold text-sm">
                                                                {year.name}
                                                            </div>
                                                            <div className="text-[11px] text-muted-foreground">
                                                                ID: #{year.id}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-semibold text-muted-foreground">
                                                    {year.start_date} s/d{" "}
                                                    {year.end_date}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black bg-background text-foreground">
                                                        {year.classrooms_count ??
                                                            0}{" "}
                                                        Kelas
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {year.is_active ? (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#D2F442] text-foreground dark:text-[#181A20] shadow-2xs">
                                                            <FontAwesomeIcon
                                                                icon={faCheck}
                                                                className="size-3"
                                                            />
                                                            Aktif
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-background text-muted-foreground">
                                                            Nonaktif
                                                        </span>
                                                    )}
                                                </td>
                                                {isAdmin && (
                                                    <td className="px-6 py-4 text-right">
                                                        {!year.is_active ? (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleToggleActiveYear(
                                                                        year,
                                                                    )
                                                                }
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#181A20] text-white hover:bg-[#D2F442] hover:text-foreground transition-colors cursor-pointer"
                                                            >
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faToggleOn
                                                                    }
                                                                    className="size-3.5"
                                                                />
                                                                <span>
                                                                    Jadikan
                                                                    Aktif
                                                                </span>
                                                            </button>
                                                        ) : (
                                                            <span className="text-xs font-bold text-muted-foreground">
                                                                (Sedang Aktif)
                                                            </span>
                                                        )}
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 2: KELAS & ROMBEL */}
                {activeTab === "classrooms" && (
                    <div className="flex flex-col gap-4">
                        {/* Filter Tahun Ajaran */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-card rounded-2xl border border-border shadow-xs">
                            <div className="flex items-center gap-3">
                                <Label
                                    htmlFor="year-select"
                                    className="text-xs font-black uppercase tracking-wider text-muted-foreground"
                                >
                                    Filter Tahun Ajaran:
                                </Label>
                                <select
                                    id="year-select"
                                    value={selectedYearId || ""}
                                    onChange={(e) =>
                                        handleFilterYear(Number(e.target.value))
                                    }
                                    className="rounded-xl border border-border bg-background px-3.5 py-2 text-xs font-extrabold text-foreground focus:border-ring focus:ring-0 cursor-pointer"
                                >
                                    {academicYears.map((y) => (
                                        <option key={y.id} value={y.id}>
                                            {y.name}{" "}
                                            {y.is_active ? "(Aktif)" : ""}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="text-xs font-bold text-muted-foreground">
                                Menampilkan {classrooms.length} Rombel / Kelas
                            </div>
                        </div>

                        {/* Classrooms Table */}
                        <div className="bg-card rounded-3xl border border-border shadow-xs overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-border bg-background/70 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                                            <th className="px-6 py-4">
                                                Nama Kelas & Tahun Ajaran
                                            </th>
                                            <th className="px-6 py-4">
                                                Program Keahlian
                                            </th>
                                            <th className="px-6 py-4 text-center">
                                                Jumlah Siswa
                                            </th>
                                            {isAdmin && (
                                                <th className="px-6 py-4 text-right">
                                                    Aksi
                                                </th>
                                            )}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border font-medium text-foreground">
                                        {classrooms.length === 0 ? (
                                            <tr>
                                                <td
                                                    colSpan={4}
                                                    className="px-6 py-12 text-center text-muted-foreground"
                                                >
                                                    Belum ada kelas terdaftar
                                                    pada tahun ajaran ini. Klik
                                                    Tambah Kelas.
                                                </td>
                                            </tr>
                                        ) : (
                                            classrooms.map((cls) => (
                                                <tr
                                                    key={cls.id}
                                                    className="hover:bg-background/50 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex size-9 items-center justify-center rounded-xl bg-background text-foreground font-black">
                                                                <FontAwesomeIcon
                                                                    icon={
                                                                        faGraduationCap
                                                                    }
                                                                    className="size-4"
                                                                />
                                                            </div>
                                                            <div>
                                                                <div className="font-extrabold text-sm">
                                                                    {cls.name}
                                                                </div>
                                                                <div className="text-[11px] text-muted-foreground">
                                                                    {
                                                                        cls
                                                                            .academic_year
                                                                            ?.name
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-black bg-[#D2F442] text-foreground dark:text-[#181A20]">
                                                                {
                                                                    cls.major
                                                                        ?.code
                                                                }
                                                            </span>
                                                            <span className="text-xs text-muted-foreground font-semibold">
                                                                {
                                                                    cls.major
                                                                        ?.name
                                                                }
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-background text-foreground">
                                                            <FontAwesomeIcon
                                                                icon={faUsers}
                                                                className="size-3 text-muted-foreground"
                                                            />
                                                            {cls.students_count ??
                                                                0}{" "}
                                                            Siswa
                                                        </span>
                                                    </td>
                                                    {isAdmin && (
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex items-center justify-end gap-1.5">
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleOpenEditClass(
                                                                            cls,
                                                                        )
                                                                    }
                                                                    className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-primary hover:text-[#D2F442] transition-colors cursor-pointer"
                                                                    title="Edit Kelas"
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={
                                                                            faPenToSquare
                                                                        }
                                                                        className="size-3.5"
                                                                    />
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDeleteClassroom(
                                                                            cls,
                                                                        )
                                                                    }
                                                                    className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-[#FF6B4A] hover:text-white transition-colors cursor-pointer"
                                                                    title="Hapus Kelas"
                                                                >
                                                                    <FontAwesomeIcon
                                                                        icon={
                                                                            faTrash
                                                                        }
                                                                        className="size-3.5"
                                                                    />
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
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL TAMBAH TAHUN AJARAN */}
            <Dialog open={isYearModalOpen} onOpenChange={setIsYearModalOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl bg-card p-6 shadow-2xl border border-border">
                    <DialogHeader>
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-[#181A20] text-[#D2F442] mb-2 font-black">
                            <FontAwesomeIcon
                                icon={faCalendarDays}
                                className="size-4"
                            />
                        </div>
                        <DialogTitle className="text-xl font-black text-foreground">
                            Tambah Tahun Ajaran
                        </DialogTitle>
                        <DialogDescription className="text-xs font-medium text-muted-foreground">
                            Format nama periode, contoh: 2026/2027 atau
                            2027/2028.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleYearSubmit}
                        className="space-y-4 pt-2"
                    >
                        <div>
                            <Label
                                htmlFor="year_name"
                                className="text-xs font-bold text-foreground"
                            >
                                Nama Tahun Ajaran{" "}
                                <span className="text-[#FF6B4A]">*</span>
                            </Label>
                            <Input
                                id="year_name"
                                type="text"
                                placeholder="Contoh: 2026/2027"
                                value={yearForm.data.name}
                                onChange={(e) =>
                                    yearForm.setData("name", e.target.value)
                                }
                                className="mt-1.5 rounded-xl border-border text-xs font-semibold focus:border-ring"
                            />
                            {yearForm.errors.name && (
                                <p className="mt-1 text-xs text-[#FF6B4A] font-bold">
                                    {yearForm.errors.name}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label
                                    htmlFor="start_date"
                                    className="text-xs font-bold text-foreground"
                                >
                                    Tanggal Mulai{" "}
                                    <span className="text-[#FF6B4A]">*</span>
                                </Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={yearForm.data.start_date}
                                    onChange={(e) =>
                                        yearForm.setData(
                                            "start_date",
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1.5 rounded-xl border-border text-xs font-semibold focus:border-ring"
                                />
                                {yearForm.errors.start_date && (
                                    <p className="mt-1 text-xs text-[#FF6B4A] font-bold">
                                        {yearForm.errors.start_date}
                                    </p>
                                )}
                            </div>

                            <div>
                                <Label
                                    htmlFor="end_date"
                                    className="text-xs font-bold text-foreground"
                                >
                                    Tanggal Selesai{" "}
                                    <span className="text-[#FF6B4A]">*</span>
                                </Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={yearForm.data.end_date}
                                    onChange={(e) =>
                                        yearForm.setData(
                                            "end_date",
                                            e.target.value,
                                        )
                                    }
                                    className="mt-1.5 rounded-xl border-border text-xs font-semibold focus:border-ring"

                                />
                                {yearForm.errors.end_date && (
                                    <p className="mt-1 text-xs text-[#FF6B4A] font-bold">
                                        {yearForm.errors.end_date}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                            <input
                                id="is_active"
                                type="checkbox"
                                checked={yearForm.data.is_active}
                                onChange={(e) =>
                                    yearForm.setData(
                                        "is_active",
                                        e.target.checked,
                                    )
                                }
                                className="size-4 rounded text-foreground focus:ring-0 cursor-pointer"
                            />
                            <Label
                                htmlFor="is_active"
                                className="text-xs font-bold text-foreground cursor-pointer"
                            >
                                Jadikan tahun ajaran aktif sekarang
                            </Label>
                        </div>

                        <DialogFooter className="pt-4 gap-2 sm:gap-0">
                            <button
                                type="button"
                                onClick={() => setIsYearModalOpen(false)}
                                className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-background transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={yearForm.processing}
                                className="rounded-xl bg-[#181A20] px-4 py-2 text-xs font-extrabold text-[#D2F442] hover:bg-[#202229] transition-colors cursor-pointer"
                            >
                                {yearForm.processing
                                    ? "Menyimpan..."
                                    : "Simpan Tahun Ajaran"}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL TAMBAH / EDIT KELAS */}
            <Dialog open={isClassModalOpen} onOpenChange={setIsClassModalOpen}>
                <DialogContent className="sm:max-w-md rounded-3xl bg-card p-6 border border-border shadow-2xl">
                    <DialogHeader>
                        <div className="flex size-10 items-center justify-center rounded-2xl bg-[#181A20] text-[#D2F442] mb-2 font-black">
                            <FontAwesomeIcon
                                icon={faLayerGroup}
                                className="size-4"
                            />
                        </div>
                        <DialogTitle className="text-xl font-black text-foreground">
                            {editingClassroom
                                ? "Edit Data Kelas"
                                : "Tambah Kelas Baru"}
                        </DialogTitle>
                        <DialogDescription className="text-xs font-medium text-muted-foreground">
                            Tentukan nama rombel, tingkat kelas, dan jurusan
                            keahlian.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={handleClassSubmit}
                        className="space-y-4 pt-2"
                    >
                        <div>
                            <Label
                                htmlFor="academic_year_id"
                                className="text-xs font-bold text-foreground"
                            >
                                Tahun Ajaran{" "}
                                <span className="text-[#FF6B4A]">*</span>
                            </Label>
                            <select
                                id="academic_year_id"
                                value={classForm.data.academic_year_id}
                                onChange={(e) =>
                                    classForm.setData(
                                        "academic_year_id",
                                        Number(e.target.value),
                                    )
                                }
                                className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:border-ring focus:ring-0"
                                required
                            >
                                {academicYears.map((y) => (
                                    <option key={y.id} value={y.id}>
                                        {y.name} {y.is_active ? "(Aktif)" : ""}
                                    </option>
                                ))}
                            </select>
                            {classForm.errors.academic_year_id && (
                                <p className="mt-1 text-xs text-[#FF6B4A] font-bold">
                                    {classForm.errors.academic_year_id}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label
                                htmlFor="major_id"
                                className="text-xs font-bold text-foreground"
                            >
                                Program Keahlian / Jurusan{" "}
                                <span className="text-[#FF6B4A]">*</span>
                            </Label>
                            <select
                                id="major_id"
                                value={classForm.data.major_id}
                                onChange={(e) =>
                                    classForm.setData(
                                        "major_id",
                                        Number(e.target.value),
                                    )
                                }
                                className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground focus:border-ring focus:ring-0"
                                required
                            >
                                {majors.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.code} - {m.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label
                                htmlFor="classroom_name"
                                className="text-xs font-bold text-foreground"
                            >
                                Nama Kelas / Rombel{" "}
                                <span className="text-[#FF6B4A]">*</span>
                            </Label>
                            <Input
                                id="classroom_name"
                                type="text"
                                placeholder="Contoh: XI DKV 1, XI MPLB 2"
                                value={classForm.data.name}
                                onChange={(e) =>
                                    classForm.setData("name", e.target.value)
                                }
                                className="mt-1.5 rounded-xl border-border text-xs font-semibold focus:border-ring"
                            />
                            {classForm.errors.name && (
                                <p className="mt-1 text-xs text-[#FF6B4A] font-bold">
                                    {classForm.errors.name}
                                </p>
                            )}
                        </div>

                        <DialogFooter className="pt-4 gap-2 sm:gap-0">
                            <button
                                type="button"
                                onClick={() => setIsClassModalOpen(false)}
                                className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-background transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={classForm.processing}
                                className="rounded-xl bg-[#181A20] px-4 py-2 text-xs font-extrabold text-[#D2F442] hover:bg-[#202229] transition-colors cursor-pointer"
                            >
                                {classForm.processing
                                    ? "Menyimpan..."
                                    : "Simpan Kelas"}
                            </button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
