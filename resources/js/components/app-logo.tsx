export default function AppLogo() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-transparent shrink-0">
                <img
                    src="/images/logo-ar-risalah.png"
                    alt="Logo SMK IT Ar-Risalah"
                    className="size-7 object-contain drop-shadow-xs"
                />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <span className="font-extrabold text-sm tracking-tight text-sidebar-foreground">
                    SIARISA
                </span>
                <span className="truncate text-[11px] text-muted-foreground font-medium">
                    SMK AR-RISALAH CARIU
                </span>
            </div>
        </div>
    );
}
