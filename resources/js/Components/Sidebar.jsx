import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import {
    LayoutDashboard, FileText, ListChecks, Monitor, UserPlus, BookPlus, X, Menu, CalendarCog, ChevronDown, ChevronRight
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
    {
        name: 'Member',
        href: '/unit',
        icon: UserPlus,
        activePath: '/unit',
        // children will be rendered under Member; adminOnly child items will be shown only to Admins
        children: [
            { name: 'Pengaturan Akun', href: '/user', icon: UserPlus, activePath: '/user', adminOnly: true },
            { name: 'Daftar Unit', href: '/unit', icon: BookPlus, activePath: '/unit' },
        ],
    },
    { name: 'Tahun Anggaran', href: '/tahun', icon: CalendarCog, activePath: '/tahun' }
];

function Sidebar({ auth, isMinimized, toggleMinimize }) {
    const { url } = usePage();
    const currentPath = url;
    const [openParent, setOpenParent] = useState(null);
    const TSU_TEAL = 'bg-teal-100/50 text-teal-700 font-semibold';
    const INACTIVE = "text-gray-700 hover:bg-gray-100/80";

    const NavLink = ({ name, href, icon: Icon, activePath, onClick, isChild = false, forceActive = false }) => {
        const isActive = forceActive || (currentPath.startsWith(activePath) && activePath !== '/');
        const baseClasses = "flex items-center transition duration-150 ease-in-out w-full whitespace-nowrap overflow-hidden";
        const padding = isChild ? 'ps-6 pe-3 py-2 text-sm rounded-md' : 'p-3 rounded-lg';
        const baseWithPadding = `${baseClasses} ${padding}`;
        const activeClasses = 'bg-teal-100/50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 font-semibold';
        const inactiveClasses = "text-gray-700 dark:text-gray-300 hover:bg-gray-100/80 dark:hover:bg-gray-700/50";

        const linkContent = (
            <Link
                href={href || '#'}
                onClick={onClick}
                className={`${baseWithPadding} ${isActive ? activeClasses : inactiveClasses}`}
            >
                <Icon size={18} className={isMinimized ? 'mx-auto' : 'me-3'} />
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
            {/* OVERLAY: Muncul hanya saat sidebar terbuka (!isMinimized) di mode mobile (sm:hidden).
                Use standard Tailwind z-index values and enable pointer events only when visible.
            */}
            <div
                className={`fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-75 z-50 transition-opacity duration-300 sm:hidden ${!isMinimized ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={toggleMinimize}
            ></div>

            {/* CONTAINER SIDEBAR */}
            <div
                className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-800 shadow-xl border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out z-40 ${desktopWidthClass} ${
                    // Mobile: Terbuka (translate-x-0) jika !isMinimized, Tertutup (-translate-x-full) jika isMinimized
                    // Desktop: Selalu translate-x-0 karena sm:w-XX mengaturnya
                    !isMinimized
                        ? 'w-64 translate-x-0'
                        : '-translate-x-full sm:translate-x-0 sm:w-20'
                    }`}
            >

                <div className={`flex items-center ${isMinimized ? 'justify-center' : 'justify-between'} h-20 px-4 border-b border-gray-100 dark:border-gray-700 transition-all duration-300`}>

                    <Link href="/dashboard" className="flex items-center">
                        <ApplicationLogo
                            isMinimized={isMinimized}
                            // Hapus class h-10 w-auto fill-current text-gray-800 transition-all duration-300
                            // Biarkan ApplicationLogo mengontrol ukurannya untuk transisi yang mulus
                            className="block fill-current text-gray-800 dark:text-gray-100"
                        />
                    </Link>

                    <button
                        onClick={toggleMinimize}
                        className={`p-1 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none transition-colors duration-150 ${isMinimized ? 'sm:mx-auto' : ''
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

                <nav className="flex-grow p-4 space-y-1 overflow-y-auto dark:divide-gray-700">
                    {navItems.map((item, index) => {
                        const hasChildren = item.children && item.children.length > 0;
                        // parent considered active if its own path or any child's path matches
                        const parentActive = currentPath.startsWith(item.activePath) || (hasChildren && item.children.some(ch => currentPath.startsWith(ch.activePath)));
                        return (
                            <div key={index}>
                                <div className="flex items-center justify-between">
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
                                        forceActive={parentActive}
                                    />

                                    {/* Toggler for children */}
                                    {!isMinimized && hasChildren && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setOpenParent(openParent === item.name ? null : item.name);
                                            }}
                                            className="p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 me-2"
                                            aria-label={`Toggle ${item.name}`}
                                        >
                                            {openParent === item.name ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                        </button>
                                    )}
                                </div>

                                {/* Render children (submenu) when sidebar not minimized and parent expanded */}
                                {!isMinimized && hasChildren && openParent === item.name && (
                                    <div className="mt-1 space-y-1">
                                        {item.children.map((child, cidx) => {
                                            if (child.adminOnly && auth?.user?.peran !== 'Admin') return null;
                                            return (
                                                <NavLink
                                                    key={cidx}
                                                    name={child.name}
                                                    href={child.href}
                                                    icon={child.icon}
                                                    activePath={child.activePath}
                                                    onClick={() => {
                                                        if (typeof window !== 'undefined' && window.innerWidth < 640 && !isMinimized) {
                                                            toggleMinimize();
                                                        }
                                                    }}
                                                    isChild={true}
                                                    forceActive={currentPath.startsWith(child.activePath)}
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>
            </div>
        </TooltipProvider>
    );
}

export default Sidebar;