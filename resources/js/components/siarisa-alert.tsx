/**
 * SiarisaAlert — Custom Alert/Dialog System
 * React Context-based, pengganti SweetAlert untuk SIARISA.
 * Terinspirasi dari desain referensi dengan palette warna SIARISA:
 *   - Obsidian   : #181A20
 *   - Lime       : #D2F442
 *   - Canvas     : #F6F7FA / #FFFFFF
 *   - Coral      : #FF6B4A
 */
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
import { usePage } from '@inertiajs/react';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { createPortal } from 'react-dom';

// ───────────────────────────────────────────
//  TYPES
// ───────────────────────────────────────────
export type AlertType =
    | 'success'
    | 'error'
    | 'warning'
    | 'info'
    | 'delete'
    | 'confirm'
    | 'loading'
    | 'welcome';

export interface AlertButton {
    label: string;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
}

export interface AlertOptions {
    type: AlertType;
    title: string;
    message?: string;
    confirmButton?: AlertButton;
    cancelButton?: AlertButton;
    /** Auto-dismiss in ms (0 = no auto-dismiss) */
    autoClose?: number;
    closable?: boolean;
}

interface AlertContextValue {
    show: (options: AlertOptions) => void;
    close: () => void;
    /** Shorthand helpers */
    success: (title: string, message?: string, onConfirm?: () => void) => void;
    error: (title: string, message?: string, onRetry?: () => void) => void;
    warning: (title: string, message?: string, onConfirm?: () => void) => void;
    info: (title: string, message?: string) => void;
    confirm: (title: string, message: string, onConfirm: () => void, onCancel?: () => void) => void;
    deleteConfirm: (title: string, message: string, onDelete: () => void) => void;
    loading: (title?: string, message?: string) => void;
    welcome: (title: string, message: string, onConfirm?: () => void) => void;
}

// ───────────────────────────────────────────
//  CONTEXT
// ───────────────────────────────────────────
const AlertContext = createContext<AlertContextValue | null>(null);

// ───────────────────────────────────────────
//  DECORATIVE SPARKLES
// ───────────────────────────────────────────
const Sparkles = ({ color }: { color: string }) => (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
        {/* Top-left sparkle */}
        <div
            className="absolute left-6 top-5 h-2 w-2 rotate-45 rounded-sm opacity-50"
            style={{ backgroundColor: color }}
        />
        {/* Top-right large */}
        <div
            className="absolute right-8 top-6 h-3 w-3 rotate-12 rounded-sm opacity-30"
            style={{ backgroundColor: color }}
        />
        {/* Bottom-left dot */}
        <div
            className="absolute bottom-7 left-10 h-1.5 w-1.5 rounded-full opacity-40"
            style={{ backgroundColor: color }}
        />
        {/* Top-left circle */}
        <div
            className="absolute left-14 top-10 h-1 w-1 rounded-full opacity-60"
            style={{ backgroundColor: color }}
        />
        {/* Bottom-right star */}
        <div
            className="absolute bottom-5 right-6 h-2.5 w-2.5 rotate-45 rounded-sm opacity-30"
            style={{ backgroundColor: color }}
        />
    </div>
);

// ───────────────────────────────────────────
//  TYPE CONFIG
// ───────────────────────────────────────────
const typeConfig = {
    success: {
        iconBg: 'bg-[#22C55E]',
        iconColor: 'text-white',
        icon: faCheck,
        iconShadow: 'shadow-[0_8px_32px_rgba(34,197,94,0.3)]',
        sparkleColor: '#22C55E',
        bgBlob: 'rgba(34,197,94,0.07)',
        confirmVariant: 'primary' as const,
    },
    error: {
        iconBg: 'bg-[#FF6B4A]',
        iconColor: 'text-white',
        icon: faXmark,
        iconShadow: 'shadow-[0_8px_32px_rgba(255,107,74,0.3)]',
        sparkleColor: '#FF6B4A',
        bgBlob: 'rgba(255,107,74,0.07)',
        confirmVariant: 'danger' as const,
    },
    warning: {
        iconBg: 'bg-[#F59E0B]',
        iconColor: 'text-white',
        icon: faTriangleExclamation,
        iconShadow: 'shadow-[0_8px_32px_rgba(245,158,11,0.3)]',
        sparkleColor: '#F59E0B',
        bgBlob: 'rgba(245,158,11,0.07)',
        confirmVariant: 'primary' as const,
    },
    info: {
        iconBg: 'bg-[#3B82F6]',
        iconColor: 'text-white',
        icon: faCircleInfo,
        iconShadow: 'shadow-[0_8px_32px_rgba(59,130,246,0.3)]',
        sparkleColor: '#3B82F6',
        bgBlob: 'rgba(59,130,246,0.07)',
        confirmVariant: 'primary' as const,
    },
    delete: {
        iconBg: 'bg-[#FF6B4A]/15',
        iconColor: 'text-[#FF6B4A]',
        icon: faTrash,
        iconShadow: '',
        sparkleColor: '#FF6B4A',
        bgBlob: 'rgba(255,107,74,0.05)',
        confirmVariant: 'danger' as const,
    },
    confirm: {
        iconBg: 'bg-[#8B5CF6]',
        iconColor: 'text-white',
        icon: faQuestion,
        iconShadow: 'shadow-[0_8px_32px_rgba(139,92,246,0.3)]',
        sparkleColor: '#8B5CF6',
        bgBlob: 'rgba(139,92,246,0.07)',
        confirmVariant: 'primary' as const,
    },
    loading: {
        iconBg: 'bg-[#E0E7FF]',
        iconColor: 'text-[#6366F1]',
        icon: faSpinner,
        iconShadow: '',
        sparkleColor: '#6366F1',
        bgBlob: 'rgba(99,102,241,0.05)',
        confirmVariant: 'primary' as const,
    },
    welcome: {
        iconBg: 'bg-[#D2F442]',
        iconColor: 'text-[#181A20]',
        icon: faRocket,
        iconShadow: 'shadow-[0_8px_32px_rgba(210,244,66,0.4)]',
        sparkleColor: '#D2F442',
        bgBlob: 'rgba(210,244,66,0.1)',
        confirmVariant: 'primary' as const,
    },
} satisfies Record<AlertType, {
    iconBg: string;
    iconColor: string;
    icon: typeof faCheck;
    iconShadow: string;
    sparkleColor: string;
    bgBlob: string;
    confirmVariant: 'primary' | 'secondary' | 'danger';
}>;

// ───────────────────────────────────────────
//  BUTTON VARIANTS
// ───────────────────────────────────────────
const buttonClass = {
    primary:
        'rounded-2xl bg-[#181A20] px-6 py-2.5 text-sm font-extrabold text-[#D2F442] hover:bg-[#202229] active:scale-95 transition-all shadow-sm cursor-pointer',
    secondary:
        'rounded-2xl border-2 border-[#E5E7EB] bg-white px-6 py-2.5 text-sm font-bold text-[#5A6272] hover:bg-[#F6F7FA] hover:border-[#D1D5DB] active:scale-95 transition-all cursor-pointer',
    danger:
        'rounded-2xl bg-[#FF6B4A] px-6 py-2.5 text-sm font-extrabold text-white hover:bg-[#E55A3B] active:scale-95 transition-all shadow-sm cursor-pointer',
    welcome:
        'rounded-2xl bg-[#D2F442] px-6 py-2.5 text-sm font-extrabold text-[#181A20] hover:bg-[#c5e43b] active:scale-95 transition-all shadow-sm cursor-pointer inline-flex items-center gap-2',
};

// ───────────────────────────────────────────
//  ALERT DIALOG COMPONENT
// ───────────────────────────────────────────
interface AlertDialogProps {
    options: AlertOptions;
    onClose: () => void;
    visible: boolean;
}

function AlertDialog({ options, onClose, visible }: AlertDialogProps) {
    const cfg = typeConfig[options.type];
    const autoCloseRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Auto-close timer
    useEffect(() => {
        if (options.autoClose && options.autoClose > 0) {
            autoCloseRef.current = setTimeout(() => {
                onClose();
            }, options.autoClose);
        }
        return () => {
            if (autoCloseRef.current) clearTimeout(autoCloseRef.current);
        };
    }, [options.autoClose, onClose]);

    // Escape key to close
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && options.closable !== false) {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onClose, options.closable]);

    const isWelcome = options.type === 'welcome';
    const isLoading = options.type === 'loading';
    const isDelete = options.type === 'delete';

    return (
        <div
            className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
                visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
        >
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
                    visible ? 'opacity-100' : 'opacity-0'
                }`}
                onClick={options.closable !== false && !isLoading ? onClose : undefined}
            />

            {/* Card */}
            <div
                className={`relative z-10 w-full max-w-sm transition-all duration-300 ${
                    visible
                        ? 'scale-100 opacity-100 translate-y-0'
                        : 'scale-90 opacity-0 translate-y-4'
                } ${isWelcome ? '' : 'rounded-3xl bg-white shadow-2xl'}`}
            >
                {/* Welcome variant — dark card */}
                {isWelcome ? (
                    <div
                        className="relative overflow-hidden rounded-3xl p-7 shadow-2xl"
                        style={{
                            background: 'linear-gradient(135deg, #181A20 0%, #232736 60%, #2A2E40 100%)',
                        }}
                    >
                        {/* Stars decoration */}
                        <div className="pointer-events-none absolute inset-0">
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="absolute h-1 w-1 rounded-full bg-white"
                                    style={{
                                        top: `${10 + Math.sin(i * 1.3) * 35}%`,
                                        left: `${10 + (i * 11) % 80}%`,
                                        opacity: 0.2 + (i % 3) * 0.15,
                                        transform: `scale(${0.6 + (i % 3) * 0.4})`,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Rocket illustration area */}
                        <div className="absolute bottom-0 right-4 flex size-28 items-end justify-center opacity-90">
                            <div className="text-6xl" style={{ filter: 'drop-shadow(0 4px 16px rgba(210,244,66,0.4))' }}>
                                <FontAwesomeIcon icon={faRocket} className="text-[#D2F442] size-16 -rotate-12" />
                            </div>
                        </div>

                        {/* Close btn */}
                        {options.closable !== false && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="absolute right-4 top-4 flex size-7 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 transition-colors cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faXmark} className="size-3" />
                            </button>
                        )}

                        <div className="relative z-10 max-w-[60%]">
                            {/* Badge icon */}
                            <div className="mb-4 inline-flex size-10 items-center justify-center rounded-2xl bg-[#D2F442]">
                                <FontAwesomeIcon icon={faCheck} className="size-4 text-[#181A20]" />
                            </div>

                            <h2 className="text-xl font-black text-white mb-1">{options.title}</h2>
                            {options.message && (
                                <p className="text-sm text-white/70 font-medium mb-5 leading-relaxed">{options.message}</p>
                            )}

                            {options.confirmButton && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        options.confirmButton?.onClick?.();
                                        onClose();
                                    }}
                                    className={buttonClass.welcome}
                                >
                                    {options.confirmButton.label}
                                    <FontAwesomeIcon icon={faRocket} className="size-3.5" />
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Standard card */
                    <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl">
                        {/* Decorative blob background */}
                        <div
                            className="absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl"
                            style={{ backgroundColor: cfg.bgBlob }}
                        />
                        <div
                            className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full blur-2xl"
                            style={{ backgroundColor: cfg.bgBlob }}
                        />

                        {/* Sparkle decorations */}
                        <Sparkles color={cfg.sparkleColor} />

                        {/* Close button */}
                        {options.closable !== false && !isLoading && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="absolute right-4 top-4 z-10 flex size-7 items-center justify-center rounded-full bg-[#F6F7FA] text-[#5A6272] hover:bg-[#E5E7EB] transition-colors cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faXmark} className="size-3" />
                            </button>
                        )}

                        <div className="relative z-10 p-7 text-center">
                            {/* Icon area */}
                            {isDelete ? (
                                /* Delete: Large 3D-ish trash icon */
                                <div className="mb-5 flex justify-center">
                                    <div className="relative">
                                        <div
                                            className={`flex h-20 w-20 items-center justify-center rounded-3xl ${cfg.iconBg}`}
                                        >
                                            <FontAwesomeIcon
                                                icon={cfg.icon}
                                                className={`size-9 ${cfg.iconColor}`}
                                            />
                                        </div>
                                        {/* Decorative dots */}
                                        <div className="absolute -right-2 -top-1 h-3 w-3 rounded-full bg-[#FF6B4A]/20" />
                                        <div className="absolute -left-1 -bottom-2 h-2 w-2 rounded-full bg-[#FF6B4A]/15" />
                                    </div>
                                </div>
                            ) : isLoading ? (
                                /* Loading: Spinning circle */
                                <div className="mb-5 flex justify-center">
                                    <div
                                        className={`flex h-20 w-20 items-center justify-center rounded-full ${cfg.iconBg} ${cfg.iconShadow}`}
                                    >
                                        <FontAwesomeIcon
                                            icon={cfg.icon}
                                            className={`size-8 ${cfg.iconColor} animate-spin`}
                                        />
                                    </div>
                                </div>
                            ) : (
                                /* Standard: Circle icon with glow */
                                <div className="mb-5 flex justify-center">
                                    <div className="relative">
                                        <div
                                            className={`flex h-20 w-20 items-center justify-center rounded-full ${cfg.iconBg} ${cfg.iconShadow}`}
                                        >
                                            <FontAwesomeIcon
                                                icon={cfg.icon}
                                                className={`size-8 ${cfg.iconColor}`}
                                            />
                                        </div>
                                        {/* Outer ring */}
                                        <div
                                            className="absolute -inset-2 rounded-full border-2 opacity-20"
                                            style={{ borderColor: cfg.sparkleColor }}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Title */}
                            <h2 className="text-xl font-black text-[#181A20] mb-2 leading-tight">
                                {options.title}
                            </h2>

                            {/* Message */}
                            {options.message && (
                                <p className="text-sm font-medium text-[#5A6272] leading-relaxed mb-6 max-w-xs mx-auto">
                                    {options.message}
                                </p>
                            )}

                            {/* Buttons */}
                            {!isLoading && (
                                <div className="flex items-center justify-center gap-3 flex-wrap">
                                    {options.cancelButton && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                options.cancelButton?.onClick?.();
                                                onClose();
                                            }}
                                            className={buttonClass.secondary}
                                        >
                                            {options.cancelButton.label}
                                        </button>
                                    )}

                                    {options.confirmButton && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                options.confirmButton?.onClick?.();
                                                onClose();
                                            }}
                                            className={
                                                options.confirmButton.variant === 'danger'
                                                    ? buttonClass.danger
                                                    : options.confirmButton.variant === 'secondary'
                                                    ? buttonClass.secondary
                                                    : isDelete
                                                    ? buttonClass.danger
                                                    : buttonClass.primary
                                            }
                                        >
                                            {isDelete && (
                                                <FontAwesomeIcon icon={faTrash} className="mr-1.5 size-3.5" />
                                            )}
                                            {options.confirmButton.label}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ───────────────────────────────────────────
//  PROVIDER
// ───────────────────────────────────────────
export function SiarisaAlertProvider({ children }: { children: React.ReactNode }) {
    const [currentAlert, setCurrentAlert] = useState<AlertOptions | null>(null);
    const [visible, setVisible] = useState(false);
    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const close = useCallback(() => {
        setVisible(false);
        closeTimeoutRef.current = setTimeout(() => {
            setCurrentAlert(null);
        }, 300); // wait for exit animation
    }, []);

    const show = useCallback((options: AlertOptions) => {
        // Clear any pending close
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        setCurrentAlert(options);
        // Trigger entrance animation after mount
        requestAnimationFrame(() => {
            requestAnimationFrame(() => setVisible(true));
        });
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        };
    }, []);

    // ── Shorthand helpers ──
    const success = useCallback((title: string, message?: string, onConfirm?: () => void) => {
        show({
            type: 'success',
            title,
            message,
            confirmButton: {
                label: 'OK',
                onClick: onConfirm,
            },
            closable: true,
        });
    }, [show]);

    const error = useCallback((title: string, message?: string, onRetry?: () => void) => {
        show({
            type: 'error',
            title,
            message,
            confirmButton: onRetry ? { label: 'Coba Lagi', onClick: onRetry } : { label: 'Tutup' },
            cancelButton: onRetry ? { label: 'Batal' } : undefined,
            closable: true,
        });
    }, [show]);

    const warning = useCallback((title: string, message?: string, onConfirm?: () => void) => {
        show({
            type: 'warning',
            title,
            message,
            confirmButton: { label: 'Lanjutkan', onClick: onConfirm },
            cancelButton: { label: 'Batal' },
            closable: true,
        });
    }, [show]);

    const info = useCallback((title: string, message?: string) => {
        show({
            type: 'info',
            title,
            message,
            confirmButton: { label: 'Mengerti' },
            closable: true,
        });
    }, [show]);

    const confirm = useCallback((
        title: string,
        message: string,
        onConfirm: () => void,
        onCancel?: () => void,
    ) => {
        show({
            type: 'confirm',
            title,
            message,
            confirmButton: { label: 'Ya, Simpan', onClick: onConfirm },
            cancelButton: { label: 'Batal', onClick: onCancel },
            closable: false,
        });
    }, [show]);

    const deleteConfirm = useCallback((
        title: string,
        message: string,
        onDelete: () => void,
    ) => {
        show({
            type: 'delete',
            title,
            message,
            confirmButton: { label: 'Hapus', onClick: onDelete },
            cancelButton: { label: 'Batal' },
            closable: false,
        });
    }, [show]);

    const loading = useCallback((title?: string, message?: string) => {
        show({
            type: 'loading',
            title: title ?? 'Mohon Tunggu...',
            message: message ?? 'Sedang memproses data Anda.',
            closable: false,
        });
    }, [show]);

    const welcome = useCallback((title: string, message: string, onConfirm?: () => void) => {
        show({
            type: 'welcome',
            title,
            message,
            confirmButton: { label: 'Mulai Sekarang', onClick: onConfirm },
            closable: true,
        });
    }, [show]);

    const value: AlertContextValue = {
        show,
        close,
        success,
        error,
        warning,
        info,
        confirm,
        deleteConfirm,
        loading,
        welcome,
    };

    return (
        <AlertContext.Provider value={value}>
            {children}
            {currentAlert &&
                createPortal(
                    <AlertDialog
                        options={currentAlert}
                        onClose={close}
                        visible={visible}
                    />,
                    document.body,
                )}
        </AlertContext.Provider>
    );
}

// ───────────────────────────────────────────
//  HOOK
// ───────────────────────────────────────────
export function useSiarisaAlert(): AlertContextValue {
    const ctx = useContext(AlertContext);
    if (!ctx) {
        throw new Error('useSiarisaAlert must be used within SiarisaAlertProvider');
    }
    return ctx;
}

// ───────────────────────────────────────────
//  INERTIA FLASH BRIDGE
//  Otomatis membaca flash message dari backend Laravel
//  dan memunculkan custom SiarisaAlert yang elegan
// ───────────────────────────────────────────
export function SiarisaFlashBridge() {
    const { flash } = usePage().props as {
        flash?: {
            success?: string | null;
            error?: string | null;
            warning?: string | null;
            info?: string | null;
        };
    };
    const alert = useSiarisaAlert();
    const lastFlashRef = useRef<string | null>(null);

    useEffect(() => {
        if (!flash) return;

        const currentSignature = JSON.stringify(flash);
        if (currentSignature === lastFlashRef.current) return;
        lastFlashRef.current = currentSignature;

        if (flash.success) {
            alert.success('Berhasil!', flash.success);
        } else if (flash.error) {
            alert.error('Terjadi Kesalahan!', flash.error);
        } else if (flash.warning) {
            alert.warning('Peringatan!', flash.warning);
        } else if (flash.info) {
            alert.info('Informasi', flash.info);
        }
    }, [flash, alert]);

    return null;
}

export default useSiarisaAlert;

