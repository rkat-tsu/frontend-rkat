import React, { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import {
    LayoutDashboard, FileText, Check, LayoutList, Monitor, BookPlus, BookOpenText,
    CalendarCog, ChevronDown, ChevronRight, ChevronsLeft, ChevronsRight,
    Users, Settings, Building2, CreditCard, FolderOpen, Database, Wallet, Route, CheckCheck,
    FileCheck2
} from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/Components/ui/tooltip";
import { usePermission } from '@/hooks/usePermission';

// MENU BAHASA INDONESIA
const navItems = [
    { name: 'Dasbor', href: '/dashboard', icon: LayoutDashboard, activePath: '/dashboard' },
    { name: 'Monitoring', href: '/monitoring', icon: Monitor, activePath: '/monitoring' },
    {
        name: 'Manajemen RKA',
        icon: FolderOpen,
        activePath: '/rkat',
        children: [
            { name: 'RKAT', href: '/rkat', icon: LayoutList, activePath: '/rkat' },
            { name: 'Daftar Ajuan RKA', href: '/daftar-ajuan', icon: FileText, activePath: '/daftar-ajuan' },
            { name: 'Persetujuan RKAT', href: '/approval', icon: Check, activePath: '/approval', hideForInputer: true },
        ],
    },
    {
        name: 'Keuangan',
        icon: Wallet,
        activePath: '/pencairan',
        children: [
            { name: 'Pencairan Dana', href: '/pencairan', icon: CreditCard, activePath: '/pencairan' },
            { name: 'Persetujuan Pencairan', href: '/pencairan/approval', icon: CheckCheck, activePath: '/pencairan/approval', hideForInputer: true },
            { name: 'LPJ (Laporan)', href: '/lpj', icon: FileCheck2 , activePath: '/lpj' },
        ],
    },
    {
        name: 'Data Master',
        icon: Database,
        activePath: '/master',
        children: [
            { name: 'Standar Biaya Operasional', href: '/sbo', icon: BookOpenText, activePath: '/sbo' },
            { name: 'Indikator Kinerja Utama', href: '/iku', icon: BookPlus, activePath: '/iku' }
        ],
    },
    {
        name: 'Pengaturan',
        icon: Settings,
        activePath: '/pengaturan',
        adminOnly: true,
        children: [
            { name: 'Tahun Anggaran', href: '/tahun', icon: CalendarCog, activePath: '/tahun', adminOnly: true },
            { name: 'Pengaturan Akun', href: '/user', icon: Users, activePath: '/user', adminOnly: true },
            { name: 'Unit Kerja', href: '/unit', icon: Building2, activePath: '/unit', adminOnly: true },
            { name: 'Alur Persetujuan', href: '/approval-path', icon: Route, activePath: '/approval-path', adminOnly: true },
        ],
    }
];

function Sidebar({ auth, isMinimized, toggleMinimize }) {
    const { url } = usePage();
    const { isAdmin, role } = usePermission();
    const currentPath = url;

    // State untuk Accordion Menu
    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (name) => {
        setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
    };

    const NavItem = ({ item, isChild = false }) => {
        const hasChildren = item.children && item.children.length > 0;

        // Cek status aktif
        let isActive = false;
        if (item.href) {
            isActive = currentPath === item.activePath || currentPath.startsWith(item.activePath + '/');
            if (item.activePath === '/pencairan' && currentPath.startsWith('/pencairan/approval')) {
                isActive = false;
            }
        } else if (hasChildren) {
            isActive = item.children.some(ch => {
                let childActive = currentPath === ch.activePath || currentPath.startsWith(ch.activePath + '/');
                if (ch.activePath === '/pencairan' && currentPath.startsWith('/pencairan/approval')) {
                    childActive = false;
                }
                return childActive;
            });
        }

        // Logic buka/tutup otomatis
        const isOpen = openMenus[item.name] || (isActive && !openMenus.hasOwnProperty(item.name) && !isMinimized);

        const baseClasses = "rounded-xl flex items-center transition-all duration-200 ease-in-out w-full whitespace-nowrap overflow-hidden relative cursor-pointer outline-none focus:outline-none";
        const padding = isChild ? 'pl-11 pr-3 py-2 text-sm' : 'px-4 py-3 my-1';
        
        const activeClasses = isChild
            ? 'bg-teal-50/50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 font-semibold'
            : 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 font-bold shadow-sm ring-1 ring-teal-100 dark:ring-teal-800';
            
        const inactiveClasses = "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200";

        const content = (
            <>
                {!isChild && isActive && !isMinimized && (
                    <div className="absolute left-0 h-6 w-1.5 bg-teal-500 rounded-r-full" />
                )}
                <item.icon size={isChild ? 18 : 22} className={`${isMinimized ? 'mx-auto' : 'mr-3'} flex-shrink-0 transition-colors duration-200`} />
                {!isMinimized && (
                    <div className="flex-grow flex justify-between items-center overflow-hidden">
                        <span className="truncate text-sm">{item.name}</span>
                        {hasChildren && (
                            <span className="ml-2 text-gray-400">
                                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </span>
                        )}
                    </div>
                )}
            </>
        );

        if (hasChildren) {
            if (isMinimized) {
                return (
                    <Tooltip delayDuration={0}>
                        <TooltipTrigger asChild>
                            <button onClick={toggleMinimize} className={`${baseClasses} ${padding} ${isActive ? activeClasses : inactiveClasses}`}>
                                {content}
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10}>
                            {item.name}
                        </TooltipContent>
                    </Tooltip>
                );
            }
            // Mode Normal: Toggle Submenu
            return (
                <div className="mb-1">
                    <button onClick={() => toggleMenu(item.name)} className={`${baseClasses} ${padding} ${isActive ? activeClasses : inactiveClasses} w-full`}>
                        {content}
                    </button>
                    {isOpen && !isMinimized && (
                        <div className="mt-1 space-y-1 relative before:absolute before:left-6 before:top-0 before:bottom-0 before:w-px before:bg-gray-200 dark:before:bg-gray-700">
                            {item.children.map((child, idx) => {
                                if (child.adminOnly && !isAdmin()) return null;
                                return <NavItem key={idx} item={child} isChild={true} />;
                            })}
                        </div>
                    )}
                </div>
            );
        }

        const handleLinkClick = () => {
            if (typeof window !== 'undefined' && window.innerWidth < 640) {
                toggleMinimize();
            }
        };

        const linkEl = (
            <Link href={item.href} onClick={handleLinkClick} className={`${baseClasses} ${padding} ${isActive ? activeClasses : inactiveClasses}`}>
                {content}
            </Link>
        );

        if (isMinimized) {
            return (
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={10}>
                        {item.name}
                    </TooltipContent>
                </Tooltip>
            );
        }
        return <div className="mb-1">{linkEl}</div>;
    };

    return (
        <TooltipProvider>
            {/* Overlay Mobile */}
            <div className={`fixed inset-0 bg-gray-900/50 dark:bg-gray-900/50 backdrop-blur-sm z-[90] sm:hidden transition-opacity ${!isMinimized ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={toggleMinimize}></div>

            {/* Sidebar Container */}
            <div className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 shadow-lg z-[100] flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${isMinimized ? 'w-0 sm:w-20 border-r-0 sm:border-r sm:border-gray-100 dark:sm:border-gray-800' : 'w-64 border-r border-gray-100 dark:border-gray-800'}`}>
                {/* Header */}
                <div className={`flex items-center ${isMinimized ? 'justify-center flex-col gap-2' : 'justify-between'} h-20 px-4 mb-2 mt-2 relative`}>
                    <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
                        <ApplicationLogo className={`text-teal-600 transition-all duration-300 ease-in-out ${isMinimized ? 'h-8 w-8' : 'h-9 w-auto'}`} />
                        {!isMinimized && (
                            <div className="flex flex-col">
                                <span className="font-bold text-lg text-gray-800 dark:text-white">ReKAT</span>
                            </div>
                        )}
                    </Link>
                    {/* Toggle Button: Selalu muncul di desktop untuk bisa kembali ke normal */}
                    <button onClick={toggleMinimize} className={`hidden sm:flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-teal-600  dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900 absolute ${isMinimized ? '-bottom-5' : 'right-2 top-1/2 -translate-y-1/2'}`}>
                        {isMinimized ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
                    </button>
                </div>

                {/* Nav List */}
                <nav className="flex-grow px-3 space-y-1 overflow-y-auto h-[calc(100vh-5rem)] scrollbar-hide pb-6 pt-4">
                    {navItems.map((item, index) => {
                        // Global visibility check
                        if (item.adminOnly && !isAdmin()) return null;
                        if (item.hideForInputer && role === 'Inputer') return null;
                        if (item.name === 'Persetujuan Pencairan' && !auth.user?.can_approve_pencairan) return null;

                        return <NavItem key={index} item={item} />;
                    })}
                </nav>
            </div>
        </TooltipProvider>
    );
}

export default Sidebar;