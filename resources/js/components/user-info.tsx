import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import type { User } from '@/types';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();
    const roles = (user.roles as string[]) || [];

    const getRoleName = () => {
        if (roles.includes('admin')) return 'Administrator';
        if (roles.includes('headmaster')) return 'Kepala Sekolah';
        if (roles.includes('teacher')) return 'Guru Pembimbing';
        if (roles.includes('student')) return 'Siswa PKL';
        if (roles.includes('industry_supervisor')) return 'Pembimbing DU/DI';
        return 'Pengguna';
    };

    return (
        <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="h-8 w-8 overflow-hidden rounded-full ring-1 ring-sidebar-border">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-full bg-[#D2F442] text-[#16181D] font-black text-xs">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold text-sidebar-foreground">{user.name}</span>
                <span className="truncate text-xs text-muted-foreground font-medium">
                    {showEmail ? user.email : getRoleName()}
                </span>
            </div>
        </div>
    );
}
