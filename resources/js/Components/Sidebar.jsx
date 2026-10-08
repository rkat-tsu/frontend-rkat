import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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

const navItems = [
    { 
        name: 'Dashboard', 
        href: '/dashboard', 
        icon: LayoutDashboard, 
        activePath: '/dashboard' 
    },
    {
        name: 'Pengajuan RKAT',
        icon: FolderOpen,
        activePath: '/daftar-ajuan',
        children: [
            { name: 'Daftar Pengajuan', href: '/daftar-ajuan', icon: FileText, activePath: '/daftar-ajuan' },
            { name: 'Rincian Kegiatan (RAB)', href: '/rkat', icon: LayoutList, activePath: '/rkat' },
            { name: 'Persetujuan RKAT', href: '/approval', icon: Check, activePath: '/approval', hideForInputer: true },
        ],
    },
    {
        name: 'Pencairan Dana',
        icon: Wallet,
        activePath: '/pencairan',
        children: [
            { name: 'Pengajuan Pencairan', href: '/pencairan', icon: CreditCard, activePath: '/pencairan' },
            { name: 'Persetujuan Pencairan', href: '/pencairan/approval', icon: CheckCheck, activePath: '/pencairan/approval', hideForInputer: true },
        ],
    },
    { 
        name: 'Laporan Pertanggungjawaban', 
        href: '/lpj', 
        icon: FileCheck2, 
        activePath: '/lpj' 
    },
    { 
        name: 'Monitoring Anggaran', 
        href: '/monitoring', 
        icon: Monitor, 
        activePath: '/monitoring' 
    },
    {
        name: 'Data Referensi',
        icon: Database,
        activePath: '/master',
        children: [
            { name: 'Standar Biaya (SBO)', href: '/sbo', icon: BookOpenText, activePath: '/sbo' },
            { name: 'Indikator Kinerja (IKU)', href: '/iku', icon: BookPlus, activePath: '/iku' },
            { name: 'Data SDM / Karyawan', href: '/karyawan', icon: Users, activePath: '/karyawan' }
        ],
    },
    {
        name: 'Pengaturan Sistem',
        icon: Settings,
        activePath: '/pengaturan',
        adminOnly: true,
        children: [
            { name: 'Tahun Anggaran', href: '/tahun', icon: CalendarCog, activePath: '/tahun', adminOnly: true },
            { name: 'Kelola Pengguna', href: '/user', icon: Users, activePath: '/user', adminOnly: true },
            { name: 'Unit Kerja', href: '/unit', icon: Building2, activePath: '/unit', adminOnly: true },
            { name: 'Alur Persetujuan', href: '/approval-path', icon: Route, activePath: '/approval-path', adminOnly: true },
            { name: 'Jenis Kegiatan', href: '/jenis-kegiatan', icon: Settings, activePath: '/jenis-kegiatan', adminOnly: true },
        ],
    }
];

function Sidebar({ auth, isMinimized, toggleMinimize }) {
    const { url } = usePage();
    const { isAdmin, role } = usePermission();
    const currentPath = url;

    // State untuk Accordion Menu
    const [openMenus, setOpenMenus] = useState({});
    const [hoveredMenu, setHoveredMenu] = useState(null);
    const [flyoutPos, setFlyoutPos] = useState({ top: 0, left: 0 });
    const hoverTimeoutRef = useRef(null);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        };
    }, []);

    // Close flyout on route change or when toggling minimize
    useEffect(() => {
        setHoveredMenu(null);
    }, [currentPath, isMinimized]);

    const handleMouseEnter = useCallback((name, buttonEl) => {
        if (!isMinimized) return;
        if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        if (buttonEl) {
            const rect = buttonEl.getBoundingClientRect();
            setFlyoutPos({ top: rect.top, left: rect.right + 6 });
        }
        setHoveredMenu(name);
    }, [isMinimized]);

    const handleMouseLeave = useCallback(() => {
        if (!isMinimized) return;
        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredMenu(null);
        }, 150);
    }, [isMinimized]);

    const toggleMenu = (name) => {
        setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
    };

    // Filter children berdasarkan permission
    const getVisibleChildren = (children) => {
        if (!children) return [];
        return children.filter(child => {
            if (child.adminOnly && !isAdmin()) return false;
            if (child.hideForInputer && role === 'Inputer') return false;
            return true;
        });
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

        // Logic buka/tutup otomatis (aktif atau di-hover atau di-toggle)
        const isOpen = openMenus[item.name] || (isActive && !openMenus.hasOwnProperty(item.name) && !isMinimized);

        const baseClasses = "rounded-xl flex items-center transition-all duration-200 ease-in-out w-full whitespace-nowrap overflow-hidden relative cursor-pointer outline-none focus:outline-none";
        const padding = isChild ? 'pl-11 pr-3 py-2 text-sm' : 'px-4 py-3 my-1';
        
        const activeClasses = isChild
            ? 'bg-teal-50/70 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 font-semibold'
            : 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 font-bold shadow-sm ring-1 ring-teal-100 dark:ring-teal-800';
            
        const inactiveClasses = "text-gray-600 dark:text-gray-400 hover:bg-teal-50/50 dark:hover:bg-gray-800/80 hover:text-teal-700 dark:hover:text-teal-300";

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
                            <span className="ml-2 text-gray-400 transition-transform duration-200">
                                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </span>
                        )}
                    </div>
                )}
            </>
        );

        if (hasChildren) {
            // Mode Minimized: Flyout Popup on Hover (via Portal)
            if (isMinimized) {
                const visibleChildren = getVisibleChildren(item.children);
                const isFlyoutOpen = hoveredMenu === item.name;

                return (
                    <div
                        onMouseEnter={(e) => handleMouseEnter(item.name, e.currentTarget.querySelector('button'))}
                        onMouseLeave={handleMouseLeave}
                        className="relative"
                    >
                        <button 
                            onClick={(e) => {
                                if (isFlyoutOpen) {
                                    setHoveredMenu(null);
                                } else {
                                    handleMouseEnter(item.name, e.currentTarget);
                                }
                            }}
                            className={`${baseClasses} ${padding} ${isActive ? activeClasses : inactiveClasses}`}
                        >
                            {content}
                        </button>

                        {/* Flyout Submenu — rendered via Portal to escape overflow-hidden */}
                        {createPortal(
                            <div
                                className={`fixed z-[300] transition-all duration-200 ease-in-out origin-left ${isFlyoutOpen
                                    ? 'opacity-100 scale-100 translate-x-0 pointer-events-auto'
                                    : 'opacity-0 scale-95 -translate-x-1 pointer-events-none'
                                }`}
                                style={{ top: flyoutPos.top, left: flyoutPos.left - 12 }}
                                onMouseEnter={() => handleMouseEnter(item.name, null)}
                                onMouseLeave={handleMouseLeave}
                            >
                                {/* Invisible bridge to connect sidebar icon seamlessly to flyout */}
                                <div className="pl-3">
                                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl shadow-teal-900/10 dark:shadow-black/40 border border-teal-100 dark:border-gray-700 py-2 min-w-[230px]">
                                        {/* Flyout Header */}
                                        <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700/80 mb-1 flex items-center justify-between">
                                            <span className="text-[11px] font-extrabold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
                                                {item.name}
                                            </span>
                                            <span className="text-[10px] bg-teal-50 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 px-1.5 py-0.5 rounded font-semibold">
                                                {visibleChildren.length} Menu
                                            </span>
                                        </div>
                                        {/* Flyout Links */}
                                        {visibleChildren.map((child, idx) => {
                                            let childActive = currentPath === child.activePath || currentPath.startsWith(child.activePath + '/');
                                            if (child.activePath === '/pencairan' && currentPath.startsWith('/pencairan/approval')) {
                                                childActive = false;
                                            }

                                            return (
                                                <Link
                                                    key={idx}
                                                    href={child.href}
                                                    onClick={() => setHoveredMenu(null)}
                                                    className={`flex items-center gap-3 px-3.5 py-2 mx-1.5 rounded-lg text-sm transition-all duration-150 ${
                                                        childActive
                                                            ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 font-bold shadow-xs'
                                                            : 'text-gray-600 dark:text-gray-400 hover:bg-teal-50/60 dark:hover:bg-gray-700/60 hover:text-teal-700 dark:hover:text-teal-300'
                                                    }`}
                                                >
                                                    <child.icon size={16} className="flex-shrink-0" />
                                                    <span className="truncate">{child.name}</span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>,
                            document.body
                        )}
                    </div>
                );
            }
            // Mode Normal: Toggle Submenu
            return (
                <div className="mb-1">
                    <button onClick={() => toggleMenu(item.name)} className={`${baseClasses} ${padding} ${isActive ? activeClasses : inactiveClasses} w-full`}>
                        {content}
                    </button>
                    {isOpen && !isMinimized && (
                        <div className="mt-1 space-y-1 relative before:absolute before:left-6 before:top-0 before:bottom-0 before:w-px before:bg-teal-100 dark:before:bg-gray-700">
                            {item.children.map((child, idx) => {
                                if (child.adminOnly && !isAdmin()) return null;
                                if (child.hideForInputer && role === 'Inputer') return null;
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
                    <Link href="/dashboard" className="flex items-center gap-2.5 overflow-hidden group">
                        <ApplicationLogo isMinimized={isMinimized} className={`transition-all duration-300 ease-in-out ${isMinimized ? 'h-8 w-8' : 'h-10 w-auto'}`} />
                        {!isMinimized && (
                            <div className="flex items-center">
                                <span className="font-extrabold text-2xl tracking-tight text-gray-900 dark:text-white font-sans select-none drop-shadow-sm">
                                    Re<span className="bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500 bg-clip-text text-transparent font-black">KAT</span>
                                </span>
                            </div>
                        )}
                    </Link>
                    {/* Toggle Button: Selalu muncul di desktop untuk bisa kembali ke normal */}
                    <button onClick={toggleMinimize} className={`hidden sm:flex items-center justify-center p-1.5 rounded-lg text-gray-400 hover:text-teal-600  dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900 absolute ${isMinimized ? '-bottom-5' : 'right-2 top-1/2 -translate-y-1/2'}`}>
                        {isMinimized ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
                    </button>
                </div>

                {/* Nav List */}
                <nav className={`flex-grow px-3 space-y-1 ${isMinimized ? '' : 'overflow-y-auto'} h-[calc(100vh-5rem)] scrollbar-hide pb-6 pt-4`}>
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
