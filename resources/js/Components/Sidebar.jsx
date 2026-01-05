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
    { name: 'RAB Items', href: '/rkat-rab-items', icon: ListChecks, activePath: '/rkat-rab-items' },
    { name: 'Rincian Anggaran', href: '/rincian-anggaran', icon: BookPlus, activePath: '/rincian-anggaran' },
    { name: 'Input IKU', href: '/iku/input', icon: BookPlus, activePath: '/iku/input' },
    { name: 'Persetujuan', href: '/approval', icon: ListChecks, activePath: '/approval' },
    { name: 'Monitoring', href: '/monitoring', icon: Monitor, activePath: '/monitoring' },
    {
        name: 'Member',
        href: '/unit',
        icon: UserPlus,
        activePath: '/unit',
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

    const NavLink = ({ name, href, icon: Icon, activePath, onClick, isChild = false, forceActive = false }) => {
        const targetHref = href || '#';
        const isActive = forceActive || (currentPath.startsWith(activePath) && activePath !== '/');
        
        const baseClasses = "flex items-center transition-all duration-200 ease-in-out w-full whitespace-nowrap overflow-hidden relative group";
        const padding = isChild ? 'pl-11 pr-3 py-2 text-sm' : 'px-4 py-3 rounded-xl my-1';
        
        // Style Active & Inactive
        const activeClasses = 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 font-bold shadow-sm ring-1 ring-teal-100 dark:ring-teal-800';
        const inactiveClasses = "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200";

        const linkContent = (
            <Link
                href={targetHref}
                onClick={onClick}
                className={`${baseClasses} ${padding} ${isActive ? activeClasses : inactiveClasses}`}
            >
                {/* Garis indikator aktif (hanya di mode desktop expanded) */}
                {!isChild && isActive && !isMinimized && (
                    <div className="absolute left-0 h-6 w-1 bg-teal-500 rounded-r-full" />
                )}

                <Icon size={isChild ? 18 : 22} className={`${isMinimized ? 'mx-auto' : 'mr-3'} flex-shrink-0 transition-colors duration-200`} />
                
                {!isMinimized && (
                    <span className="flex-grow truncate text-sm">{name}</span>
                )}
            </Link>
        );

        if (isMinimized && typeof window !== 'undefined' && window.innerWidth >= 640) {
            return (
                <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                        {linkContent}
                    </TooltipTrigger>
                    <TooltipContent side="right" className="bg-gray-800 text-white border-gray-700 ml-2 shadow-lg">
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
            {/* PENTING: Z-Index 100 
               Ini memastikan Sidebar SELALU di atas konten halaman apapun (termasuk RKAT form yang membandel).
            */}
            <div
                className={`fixed top-0 left-0 h-screen bg-white dark:bg-gray-900 shadow-[4px_0_24px_rgba(0,0,0,0.02)] border-r border-gray-100 dark:border-gray-800 transition-all duration-300 ease-in-out z-[100] ${desktopWidthClass} ${
                    !isMinimized
                        ? 'w-64 translate-x-0'
                        : '-translate-x-full sm:translate-x-0 sm:w-20'
                    }`}
            >
                {/* Header Sidebar (Logo) */}
                <div className={`flex items-center ${isMinimized ? 'justify-center' : 'justify-between'} h-16 px-4 mb-2 mt-2`}>
                    <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
                        <ApplicationLogo
                            className={`fill-current text-teal-600 transition-all duration-300 ${isMinimized ? 'h-8 w-8' : 'h-9 w-auto'}`}
                        />
                        {!isMinimized && (
                            <div className="flex flex-col">
                                <span className="font-bold text-lg text-gray-800 dark:text-white leading-none tracking-tight">
                                    RKAT<span className="text-teal-600">TSU</span>
                                </span>
                                <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">System</span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigasi Scrollable */}
                <nav className="flex-grow px-3 space-y-1 overflow-y-auto h-[calc(100vh-5rem)] scrollbar-hide pb-6">
                    {navItems.map((item, index) => {
                        const hasChildren = item.children && item.children.length > 0;
                        const parentActive = currentPath.startsWith(item.activePath) || (hasChildren && item.children.some(ch => currentPath.startsWith(ch.activePath)));
                        const [isOpen, setIsOpen] = useState(parentActive);

                        return (
                            <div key={index} className="mb-1">
                                <div className="flex items-center justify-between">
                                    <div className="flex-grow">
                                        <NavLink
                                            name={item.name}
                                            href={item.href}
                                            icon={item.icon}
                                            activePath={item.activePath}
                                            onClick={() => {
                                                if (typeof window !== 'undefined' && window.innerWidth < 640 && !isMinimized) {
                                                    toggleMinimize();
                                                }
                                            }}
                                            forceActive={parentActive}
                                        />
                                    </div>

                                    {/* Toggle Anak Menu */}
                                    {!isMinimized && hasChildren && (
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setIsOpen(!isOpen);
                                                setOpenParent(openParent === item.name ? null : item.name);
                                            }}
                                            className={`p-1 mr-1 rounded-full transition-all duration-200 ${parentActive ? 'text-teal-600 bg-teal-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                        >
                                            {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                        </button>
                                    )}
                                </div>

                                {/* Anak Menu */}
                                {!isMinimized && hasChildren && isOpen && (
                                    <div className="mt-1 space-y-1 relative before:absolute before:left-6 before:top-0 before:bottom-0 before:w-px before:bg-gray-200 dark:before:bg-gray-700">
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