import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import {
    LayoutDashboard, FileText, ListChecks, Monitor, UserPlus, BookPlus, X, Menu, CalendarCog
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, activePath: '/dashboard' },
    { name: 'Input Rkat', href: '/rkat/input', icon: FileText, activePath: '/rkat/input' },
    { name: 'Input IKU', href: '/iku/input', icon: BookPlus, activePath: '/iku/input' },
    { name: 'Persetujuan', href: '/approval', icon: ListChecks, activePath: '/approval' },
    { name: 'Monitoring', href: '/monitoring', icon: Monitor, activePath: '/monitoring' },
    { name: 'Buat Akun', href: '/master/user', icon: UserPlus, activePath: '/master/user' },
    { name: 'Tahun Anggaran', href: '/master/tahun-anggaran', icon: CalendarCog, activePath: '/master/tahun-anggaran' }

];

function Sidebar({ auth, isMinimized, toggleMinimize }) {
    const { url } = usePage();
    const currentPath = url;
    const TSU_TEAL = 'bg-teal-100/50 text-teal-700 font-semibold';
    const INACTIVE = "text-gray-700 hover:bg-gray-100/80";

    const NavLink = ({ name, href, icon: Icon, activePath, onClick }) => {
        const isActive = currentPath.startsWith(activePath) && activePath !== '/';
        const baseClasses = "flex items-center p-3 rounded-lg transition duration-150 ease-in-out w-full whitespace-nowrap overflow-hidden";
        const activeClasses = TSU_TEAL;
        const inactiveClasses = INACTIVE;

        const linkContent = (
            <Link
                href={href || '#'}
                onClick={onClick}
                className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            >
                <Icon size={20} className={isMinimized ? 'mx-auto' : 'mr-3'} />
                {!isMinimized && <span className="flex-grow">{name}</span>}
            </Link>
        );

        if (isMinimized && typeof window !== 'undefined' && window.innerWidth >= 640) {
            return (
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>{name}</p>
                    </TooltipContent>
                </Tooltip>
            );
        }

        return linkContent;
    };

    const desktopWidthClass = isMinimized ? 'sm:w-20' : 'sm:w-64';

    return (
        <TooltipProvider>
            {/* OVERLAY: Muncul hanya saat sidebar terbuka (!isMinimized) di mode mobile (sm:hidden) */}
            <div
                className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-40 transition-opacity duration-300 sm:hidden ${!isMinimized ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={toggleMinimize}
            ></div>

            {/* CONTAINER SIDEBAR */}
            <div
                className={`fixed top-0 left-0 h-screen bg-white shadow-xl border-r border-gray-200 transition-all duration-300 ease-in-out z-50 
                            ${desktopWidthClass} 
                            ${
                    // Mobile: Terbuka (translate-x-0) jika !isMinimized, Tertutup (-translate-x-full) jika isMinimized
                    // Desktop: Selalu translate-x-0 karena sm:w-XX mengaturnya
                    !isMinimized
                        ? 'w-64 translate-x-0'
                        : '-translate-x-full sm:translate-x-0 sm:w-20'
                    }`}
            >

                <div className={`flex items-center ${isMinimized ? 'justify-center' : 'justify-between'} h-20 px-4 border-b border-gray-100 transition-all duration-300`}>

                    <Link href="/dashboard" className="flex items-center">
                        <ApplicationLogo
                            isMinimized={isMinimized}
                            // Hapus class h-10 w-auto fill-current text-gray-800 transition-all duration-300
                            // Biarkan ApplicationLogo mengontrol ukurannya untuk transisi yang mulus
                            className="block fill-current text-gray-800"
                        />
                    </Link>

                    <button
                        onClick={toggleMinimize}
                        className={`p-1 rounded-full text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors duration-150 ${isMinimized ? 'sm:mx-auto' : ''
                            }`}
                        title={typeof window !== 'undefined' && window.innerWidth < 640 ? 'Tutup Menu' : (isMinimized ? 'Perluas Menu' : 'Minimalkan Menu')}
                    >
                        {/* ICON TOGGLE: X jika terbuka di mobile, Menu (garis 3) selain itu */}
                        {(typeof window !== 'undefined' && window.innerWidth < 640 && !isMinimized) ? (
                            <X size={20} />
                        ) : (
                            <Menu size={20} />
                        )}
                    </button>
                </div>

                <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
                    {navItems.map((item, index) => (
                        <div key={index}>
                            <NavLink
                                name={item.name}
                                href={item.href}
                                icon={item.icon}
                                activePath={item.activePath}
                                onClick={() => {
                                    // Tutup sidebar di mobile setelah klik navigasi
                                    if (typeof window !== 'undefined' && window.innerWidth < 640 && !isMinimized) {
                                        toggleMinimize();
                                    }
                                }}
                            />
                        </div>
                    ))}
                </nav>
            </div>
        </TooltipProvider>
    );
}

export default Sidebar;