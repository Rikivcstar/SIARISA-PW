/**
 * SiarisaAlert Demo Page — Showcase semua tipe alert
 * Akses via: /demo/alerts (hanya untuk development)
 */
import { Head } from '@inertiajs/react';
import {
    faCheck,
    faCircleInfo,
    faQuestion,
    faRocket,
    faSpinner,
    faTrash,
    faTriangleExclamation,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSiarisaAlert } from '@/components/siarisa-alert';

type DemoCard = {
    label: string;
    description: string;
    iconBg: string;
    iconColor: string;
    icon: typeof faCheck;
    action: () => void;
};

export default function AlertsDemoPage() {
    const alert = useSiarisaAlert();

    const demos: DemoCard[] = [
        {
            label: 'Berhasil (Success)',
            description: 'Data berhasil disimpan dengan sukses.',
            iconBg: 'bg-[#22C55E]',
            iconColor: 'text-white',
            icon: faCheck,
            action: () =>
                alert.success('Berhasil!', 'Data berhasil disimpan dengan sukses.'),
        },
        {
            label: 'Error',
            description: 'Something went wrong. Silakan coba lagi.',
            iconBg: 'bg-[#FF6B4A]',
            iconColor: 'text-white',
            icon: faXmark,
            action: () =>
                alert.error(
                    'Terjadi Kesalahan!',
                    'Something went wrong. Silakan coba lagi nanti.',
                    () => alert.info('Mencoba ulang...'),
                ),
        },
        {
            label: 'Peringatan (Warning)',
            description: 'Tindakan ini tidak dapat dibatalkan.',
            iconBg: 'bg-[#F59E0B]',
            iconColor: 'text-white',
            icon: faTriangleExclamation,
            action: () =>
                alert.warning(
                    'Peringatan!',
                    'Tindakan ini tidak dapat dibatalkan. Pastikan Anda sudah yakin.',
                    () => alert.success('Lanjut!', 'Tindakan berhasil dilakukan.'),
                ),
        },
        {
            label: 'Informasi (Info)',
            description: 'Pastikan data yang Anda masukkan sudah benar.',
            iconBg: 'bg-[#3B82F6]',
            iconColor: 'text-white',
            icon: faCircleInfo,
            action: () =>
                alert.info(
                    'Informasi',
                    'Pastikan data yang Anda masukkan sudah benar sebelum menyimpan.',
                ),
        },
        {
            label: 'Hapus Data (Delete)',
            description: 'Data yang dihapus tidak dapat dikembalikan.',
            iconBg: 'bg-[#FF6B4A]/15',
            iconColor: 'text-[#FF6B4A]',
            icon: faTrash,
            action: () =>
                alert.deleteConfirm(
                    'Hapus Data?',
                    'Data yang dihapus tidak dapat dikembalikan. Lanjutkan?',
                    () => alert.success('Terhapus!', 'Data berhasil dihapus dari sistem.'),
                ),
        },
        {
            label: 'Loading / Proses',
            description: 'Sedang memproses data Anda.',
            iconBg: 'bg-[#E0E7FF]',
            iconColor: 'text-[#6366F1]',
            icon: faSpinner,
            action: () => {
                alert.loading('Mohon Tunggu...', 'Sedang memproses data Anda.');
                setTimeout(() => {
                    alert.close();
                    alert.success('Selesai!', 'Data berhasil diproses.');
                }, 2500);
            },
        },
        {
            label: 'Konfirmasi (Confirm)',
            description: 'Perubahan ini akan disimpan secara permanen.',
            iconBg: 'bg-[#8B5CF6]',
            iconColor: 'text-white',
            icon: faQuestion,
            action: () =>
                alert.confirm(
                    'Apakah Anda yakin?',
                    'Perubahan ini akan disimpan secara permanen dan tidak dapat dibatalkan.',
                    () => alert.success('Tersimpan!', 'Perubahan berhasil disimpan.'),
                    () => alert.info('Dibatalkan', 'Perubahan tidak jadi disimpan.'),
                ),
        },
        {
            label: 'Selamat Datang (Welcome)',
            description: 'Anda berhasil login ke dalam sistem.',
            iconBg: 'bg-[#D2F442]',
            iconColor: 'text-[#181A20]',
            icon: faRocket,
            action: () =>
                alert.welcome(
                    'Selamat Datang!',
                    'Anda berhasil login ke dalam sistem SIARISA. Mulai kelola data PKL dan PPDB.',
                    () => alert.success('Siap!', 'Selamat bekerja.'),
                ),
        },
    ];

    return (
        <>
            <Head title="Demo Alert - SIARISA" />

            <div className="min-h-screen bg-[#F6F7FA] p-4 md:p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#181A20] text-[#D2F442]">
                                <FontAwesomeIcon icon={faRocket} className="size-4" />
                            </div>
                            <h1 className="text-2xl font-black text-[#181A20]">
                                SIARISA Alert System
                            </h1>
                        </div>
                        <p className="text-sm text-[#5A6272] font-medium">
                            Custom alert dialog system berbasis React Context. Klik kartu di bawah untuk melihat preview masing-masing tipe alert.
                        </p>
                    </div>

                    {/* Code Usage Guide */}
                    <div className="mb-6 bg-[#181A20] rounded-3xl p-5 text-sm font-mono">
                        <div className="text-[#D2F442] font-black text-xs uppercase tracking-widest mb-3">
                            Cara Penggunaan
                        </div>
                        <pre className="text-white/80 leading-relaxed text-xs overflow-x-auto">
{`// 1. Import hook
import { useSiarisaAlert } from '@/components/siarisa-alert';

// 2. Gunakan dalam komponen
const alert = useSiarisaAlert();

// 3. Panggil sesuai kebutuhan
alert.success('Berhasil!', 'Data berhasil disimpan.');
alert.error('Error!', 'Gagal menyimpan data.');
alert.warning('Peringatan!', 'Tindakan tidak dapat dibatalkan.');
alert.info('Info', 'Pastikan data sudah benar.');
alert.deleteConfirm('Hapus Data?', 'Lanjutkan?', () => doDelete());
alert.confirm('Yakin?', 'Perubahan permanen.', () => doSave());
alert.loading('Memproses...'); // Tutup dengan: alert.close()
alert.welcome('Selamat Datang!', 'Login berhasil.');`}
                        </pre>
                    </div>

                    {/* Demo Cards Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {demos.map((demo) => (
                            <button
                                key={demo.label}
                                type="button"
                                onClick={demo.action}
                                className="group bg-white rounded-3xl p-5 border border-[#181A20]/8 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left cursor-pointer"
                            >
                                <div
                                    className={`inline-flex size-11 items-center justify-center rounded-2xl ${demo.iconBg} mb-3`}
                                >
                                    <FontAwesomeIcon
                                        icon={demo.icon}
                                        className={`size-5 ${demo.iconColor}`}
                                    />
                                </div>
                                <div className="font-extrabold text-sm text-[#181A20] mb-1 group-hover:text-[#181A20]">
                                    {demo.label}
                                </div>
                                <div className="text-xs text-[#5A6272] font-medium leading-relaxed">
                                    {demo.description}
                                </div>
                                <div className="mt-3 inline-flex items-center text-[10px] font-black text-[#D2F442] bg-[#181A20] rounded-full px-2.5 py-1">
                                    Klik untuk Preview
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Advanced Usage */}
                    <div className="mt-6 bg-white rounded-3xl p-5 border border-[#181A20]/8">
                        <div className="text-xs font-black uppercase tracking-widest text-[#5A6272] mb-3">
                            Simulasi Loading → Success Flow
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                alert.loading('Menyimpan Data...', 'Proses berlangsung selama 2 detik.');
                                setTimeout(() => {
                                    alert.close();
                                    setTimeout(() => {
                                        alert.success('Data Tersimpan!', 'Semua perubahan berhasil disimpan ke dalam sistem.');
                                    }, 350);
                                }, 2000);
                            }}
                            className="rounded-2xl bg-[#181A20] px-5 py-2.5 text-xs font-extrabold text-[#D2F442] hover:bg-[#202229] transition-colors cursor-pointer"
                        >
                            Simulasi Loading → Success
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

