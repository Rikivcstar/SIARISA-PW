import { Form, Head, Link } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import GeometricBackground from '@/components/geometric-background';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import { Checkbox } from '@/components/ui/checkbox';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative flex h-screen min-h-screen w-full flex-col justify-between overflow-hidden bg-white text-slate-800 font-sans selection:bg-emerald-600 selection:text-white">
            <Head title="Login - SIARISA PKL Ar-Risalah" />

            <PasskeyVerify />

            {/* Geometric Diagonal SVG Background ala Mentari UNPAM */}
            <GeometricBackground />

            {/* Top Navigation Bar: Mentari UNPAM Style */}
            <header className="relative z-10 flex w-full items-center justify-between  px-6 py-4 sm:px-10 lg:px-16 backdrop-blur-xs shrink-0">
                {/* Top-Left: Logo & Nama Sistem */}
                <div className="flex items-center gap-3">
                    <img
                        src="/images/logo-ar-risalah.png"
                        alt="Logo SIARISA"
                        className="size-11 sm:size-12 object-contain"
                    />
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                                SIARISA
                            </span>
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-500 font-normal">
                            Sistem Informasi Manajemen PKL Terintegrasi PPDB
                        </p>
                    </div>
                </div>

                {/* Top-Right: Logo & Nama Yayasan / Sekolah */}
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
                            SMK YAYASAN AR-RISALAH
                        </p>
                        <p className="text-[11px] text-slate-500">
                            CARIU - JONGGOL
                        </p>
                    </div>
                    <img
                        src="/images/logo-ar-risalah.png"
                        alt="Logo Yayasan Ar-Risalah Jakarta"
                        className="size-10 sm:size-11 object-contain"
                    />
                </div>
            </header>

            {/* Main Content Area: Split 50-50, Clean Light Theme with Geometric Backdrop */}
            <main className="relative z-10 flex flex-1 items-center justify-center px-6 sm:px-10 lg:px-16 overflow-y-auto">
                <div className="flex w-full max-w-6xl items-center justify-between gap-8 lg:gap-16 py-6">
                    {/* Left Column: Learning Illustration */}
                    <div className="hidden flex-1 items-center justify-center lg:flex select-none">
                        <div className="relative max-w-[460px] xl:max-w-[500px] w-full">
                            <img
                                src="/images/Online_transparent.gif"
                                alt="Ilustrasi Pembelajaran Praktik Kerja Lapangan"
                                className="w-full object-contain"
                            />
                        </div>
                    </div>

                    {/* Right Column: Clean Login Form */}
                    <div className="w-full max-w-[420px] shrink-0 mx-auto lg:mx-0">
                        {/* Form Header */}
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <img
                                    src="/images/logo-ar-risalah.png"
                                    alt="SIARISA"
                                    className="size-7 object-contain"
                                />
                                <span className="text-base font-extrabold tracking-tight text-slate-900">
                                    SIARISA
                                </span>
                            </div>

                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                                Selamat Datang! <span className="inline-block animate-wave origin-bottom-right">👋</span>
                            </h1>
                            <p className="mt-1 text-sm text-slate-600">
                                Silakan masuk ke akun Anda, dan mulai kegiatan Praktik Kerja Lapangan Anda.
                            </p>

                            {/* Petunjuk Pengguna ala Mentari UNPAM */}
                            <div className="mt-3 text-xs text-slate-500 leading-relaxed border-t border-slate-200/60 pt-2 space-y-0.5">
                                <p>• Siswa login menggunakan akun <strong className="text-slate-700">NIS / NISN</strong></p>
                                <p>• Guru &amp; Pembimbing Industri login menggunakan <strong className="text-slate-700">Email / NIP</strong></p>
                            </div>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="mt-4 rounded-lg bg-emerald-50 p-3 text-center text-xs font-semibold text-emerald-700 border border-emerald-200">
                                {status}
                            </div>
                        )}

                        {/* Form Inputs */}
                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="mt-6 flex flex-col gap-4"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Username field */}
                                    <div className="space-y-1">
                                        <label
                                            htmlFor="email"
                                            className="text-xs font-medium text-slate-700"
                                        >
                                            Username
                                        </label>
                                        <input
                                            id="email"
                                            type="text"
                                            name="email"
                                            required
                                            autoFocus
                                            tabIndex={1}
                                            autoComplete="username"
                                            placeholder="NISN / Username / Email"
                                            className="w-full rounded-lg border border-slate-300 bg-white/90 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all shadow-xs"
                                        />
                                        <InputError
                                            message={errors.email}
                                            className="mt-1 text-xs text-rose-600"
                                        />
                                    </div>

                                    {/* Password field */}
                                    <div className="space-y-1">
                                        <label
                                            htmlFor="password"
                                            className="text-xs font-medium text-slate-700"
                                        >
                                            Password
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="password"
                                                type={showPassword ? 'text' : 'password'}
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="Kata sandi"
                                                className="w-full rounded-lg border border-slate-300 bg-white/90 px-3.5 py-2.5 pr-10 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all shadow-xs"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword((prev) => !prev)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                                                tabIndex={-1}
                                                aria-label={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="size-4" />
                                                ) : (
                                                    <Eye className="size-4" />
                                                )}
                                            </button>
                                        </div>
                                        <InputError
                                            message={errors.password}
                                            className="mt-1 text-xs text-rose-600"
                                        />
                                    </div>

                                    {/* Remember Me & Lupa Password */}
                                    <div className="flex items-center justify-between text-xs pt-0.5">
                                        <label
                                            htmlFor="remember"
                                            className="flex items-center gap-2 text-slate-600 cursor-pointer select-none"
                                        >
                                            <Checkbox
                                                id="remember"
                                                name="remember"
                                                tabIndex={3}
                                            />
                                            <span>Ingat Saya</span>
                                        </label>
                                        {canResetPassword && (
                                            <Link
                                                href={request()}
                                                tabIndex={5}
                                                className="text-emerald-600 hover:text-emerald-800 font-medium hover:underline"
                                            >
                                                Lupa Password?
                                            </Link>
                                        )}
                                    </div>

                                    {/* Submit Button: MASUK ala Mentari */}
                                    <button
                                        type="submit"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                        className="mt-2 w-full rounded-lg bg-emerald-500 py-3 text-center text-sm font-bold tracking-wider text-white hover:bg-emerald-800 active:scale-[0.99] transition-all shadow-sm cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-2"
                                    >
                                        {processing && <Spinner className="size-4 text-white" />}
                                        <span>MASUK</span>
                                    </button>
                                </>
                            )}
                        </Form>
                    </div>
                </div>
            </main>

            {/* Clean Footer Bar */}
            <footer className="relative z-10 w-full py-3.5 px-6 sm:px-10 lg:px-16 text-center text-xs text-slate-400 shrink-0">
                <p>
                    © {new Date().getFullYear()} Yayasan Ar-Risalah Cariu. Sistem Informasi Manajemen PKL Terintegrasi PPDB.
                </p>
            </footer>
        </div>
    );
}

Login.layout = (page: React.ReactNode) => page;
