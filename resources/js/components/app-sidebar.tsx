import { Link, usePage } from '@inertiajs/react';
import {
    faAward,
    faBookOpenReader,
    faBriefcase,
    faBuilding,
    faCalendarCheck,
    faChalkboardUser,
    faChevronDown,
    faChevronUp,
    faGaugeHigh,
    faGear,
    faSchool,
    faUserCheck,
    faUserGraduate,
    faUsers,
    type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useState } from 'react';
import AppLogo from '@/components/app-logo';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard } from '@/routes';

interface NavItemWithBadge {
    title: string;
    href: string;
    icon: IconDefinition;
    badge?: number | string | null;
    badgeVariant?: 'default' | 'coral';
}

export function AppSidebar() {
    const { auth, counts } = usePage().props as {
        auth?: { user?: { roles?: string[] } };
        counts?: {
            industries?: number;
            students?: number;
            teachers?: number;
            pending_pkl?: number;
            pending_journals?: number;
        };
    };
    const { isCurrentUrl } = useCurrentUrl();
    const roles = auth?.user?.roles ?? [];

    const isAdmin = roles.includes('admin');
    const isTeacher = roles.includes('teacher');
    const isStudent = roles.includes('student');
    const isIndustry = roles.includes('industry_supervisor');

    // State untuk hide/show section dengan panah bawah & atas
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        master: true,
        pkl: true,
        system: true,
    });

    const toggleSection = (key: string) => {
        setOpenSections((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    // Menu Utama
    const mainItems: NavItemWithBadge[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: faGaugeHigh,
        },
    ];

    // Master Data (Admin)
    const masterItems: NavItemWithBadge[] = [
        {
            title: 'DUDI / Industri Mitra',
            href: '/master/industries',
            icon: faBuilding,
            badge: counts?.industries ?? 0,
            badgeVariant: 'default',
        },
        {
            title: 'Tahun Ajaran & Kelas',
            href: '/master/academic-years',
            icon: faSchool,
        },
        {
            title: 'Data Guru Pembimbing',
            href: '/master/teachers',
            icon: faChalkboardUser,
            badge: counts?.teachers ?? 0,
            badgeVariant: 'default',
        },
        {
            title: 'Data Siswa',
            href: '/master/students',
            icon: faUserGraduate,
            badge: counts?.students ?? 0,
            badgeVariant: 'default',
        },
    ];

    // Modul PKL - Admin
    const pklAdminItems: NavItemWithBadge[] = [
        {
            title: 'Pengajuan & Penempatan',
            href: '/pkl/applications',
            icon: faBriefcase,
            badge: counts?.pending_pkl && counts.pending_pkl > 0 ? counts.pending_pkl : null,
            badgeVariant: 'coral',
        },
        {
            title: 'Rekap Presensi & Jurnal',
            href: '/pkl/monitoring',
            icon: faBookOpenReader,
            badge: counts?.pending_journals && counts.pending_journals > 0 ? counts.pending_journals : null,
            badgeVariant: 'coral',
        },
        {
            title: 'Rekap Nilai PKL',
            href: '/pkl/grades',
            icon: faAward,
        },
    ];

    // Modul PKL - Siswa
    const pklStudentItems: NavItemWithBadge[] = [
        {
            title: 'Pengajuan Tempat PKL',
            href: '/pkl/my-application',
            icon: faBriefcase,
        },
        {
            title: 'Absensi Harian',
            href: '/pkl/attendance',
            icon: faCalendarCheck,
        },
        {
            title: 'Jurnal Kegiatan',
            href: '/pkl/journal',
            icon: faBookOpenReader,
        },
        {
            title: 'Nilai & Sertifikat',
            href: '/pkl/my-grade',
            icon: faAward,
        },
    ];

    // Modul PKL - Guru Pembimbing
    const pklTeacherItems: NavItemWithBadge[] = [
        {
            title: 'Siswa Bimbingan',
            href: '/pkl/supervisor/students',
            icon: faUsers,
        },
        {
            title: 'Validasi Jurnal',
            href: '/pkl/supervisor/journals',
            icon: faUserCheck,
        },
        {
            title: 'Penilaian Pembimbing',
            href: '/pkl/supervisor/grades',
            icon: faAward,
        },
    ];

    // Modul PKL - Pembimbing Industri
    const pklIndustryItems: NavItemWithBadge[] = [
        {
            title: 'Siswa PKL Industri',
            href: '/pkl/industry/students',
            icon: faUsers,
        },
        {
            title: 'Validasi Jurnal PKL',
            href: '/pkl/industry/journals',
            icon: faUserCheck,
        },
        {
            title: 'Penilaian Industri (60%)',
            href: '/pkl/industry/grades',
            icon: faAward,
        },
    ];

    // Render individual nav items adhering to starter kit theme
    const renderNavItems = (items: NavItemWithBadge[]) => (
        <SidebarMenu className="space-y-1">
            {items.map((item) => {
                const active = isCurrentUrl(item.href);

                return (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={active}
                            tooltip={{ children: item.title }}
                            className="data-[active=true]:bg-[#D2F442] data-[active=true]:text-[#16181D] data-[active=true]:font-bold data-[active=true]:shadow-xs hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-sidebar-foreground/80 font-medium transition-colors"
                        >
                            <Link href={item.href} prefetch>
                                <FontAwesomeIcon
                                    icon={item.icon}
                                    className={`size-4 shrink-0 transition-colors ${
                                        active
                                            ? 'text-[#16181D]'
                                            : 'text-sidebar-foreground/70 group-hover/menu-button:text-sidebar-accent-foreground'
                                    }`}
                                />
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>

                        {/* Count Badge on the right */}
                        {item.badge !== undefined && item.badge !== null && (
                            <SidebarMenuBadge
                                className={
                                    active
                                        ? 'bg-[#16181D]/15 text-[#16181D] font-bold'
                                        : item.badgeVariant === 'coral'
                                          ? 'bg-[#FF6B4A] text-white font-bold'
                                          : 'bg-sidebar-accent text-sidebar-foreground/70 font-semibold'
                                }
                            >
                                {item.badge}
                            </SidebarMenuBadge>
                        )}
                    </SidebarMenuItem>
                );
            })}
        </SidebarMenu>
    );

    // Render group with perfectly aligned up/down arrows
    const renderGroup = (
        sectionKey: string,
        label: string,
        items: NavItemWithBadge[]
    ) => {
        if (items.length === 0) return null;
        const isOpen = openSections[sectionKey] ?? true;

        return (
            <SidebarGroup key={sectionKey} className="px-2 py-1">
                <SidebarGroupLabel asChild className="w-full">
                    <button
                        type="button"
                        onClick={() => toggleSection(sectionKey)}
                        className="flex w-full items-center justify-between px-2 py-1 text-xs font-bold uppercase tracking-wider text-sidebar-foreground/60 hover:text-sidebar-foreground transition-colors cursor-pointer group-data-[collapsible=icon]:hidden group/header"
                    >
                        <span>{label}</span>
                        <span className="flex size-5 items-center justify-center rounded-md text-sidebar-foreground/40 group-hover/header:text-sidebar-foreground group-hover/header:bg-sidebar-accent transition-colors">
                            <FontAwesomeIcon
                                icon={isOpen ? faChevronUp : faChevronDown}
                                className="size-2.5 transition-transform duration-200"
                            />
                        </span>
                    </button>
                </SidebarGroupLabel>

                {isOpen && (
                    <div className="mt-1">
                        {renderNavItems(items)}
                    </div>
                )}
            </SidebarGroup>
        );
    };

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
            className="border-r border-sidebar-border/40"
        >
            {/* Header Brand */}
            <SidebarHeader className="border-b border-sidebar-border/40">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild className="hover:bg-transparent">
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* Scrollable Nav Content */}
            <SidebarContent className="gap-1 py-2">
                {/* Menu Utama */}
                <SidebarGroup className="px-2 py-1">
                    <SidebarGroupLabel className="text-sidebar-foreground/60 font-bold text-xs uppercase tracking-wider px-2">
                        Utama
                    </SidebarGroupLabel>
                    <div className="mt-1">
                        {renderNavItems(mainItems)}
                    </div>
                </SidebarGroup>

                {/* Master Data (Collapsible) */}
                {isAdmin && renderGroup('master', 'Master Data', masterItems)}

                {/* Manajemen PKL (Collapsible) */}
                {isAdmin && renderGroup('pkl', 'Manajemen PKL', pklAdminItems)}
                {isStudent && renderGroup('pkl', 'Kegiatan PKL', pklStudentItems)}
                {isTeacher && renderGroup('pkl', 'Bimbingan PKL', pklTeacherItems)}
                {isIndustry && renderGroup('pkl', 'Evaluasi PKL', pklIndustryItems)}

                {/* Sistem & Pengaturan (Collapsible) */}
                {isAdmin &&
                    renderGroup('system', 'Sistem', [
                        {
                            title: 'Pengaturan Sekolah',
                            href: '/master/settings',
                            icon: faGear,
                        },
                    ])}
            </SidebarContent>

            {/* Footer User */}
            <SidebarFooter className="border-t border-sidebar-border/40">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
