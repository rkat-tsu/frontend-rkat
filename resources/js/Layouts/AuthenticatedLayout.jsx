import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import Dropdown from '@/Components/Dropdown';
import Sidebar from '@/Components/Sidebar';
import { Menu } from 'lucide-react';
// Asumsikan Anda telah membuat AutomaticBreadcrumbs di '@/Components' atau '@/Utils'
import { AutomaticBreadcrumbs } from '@/Components/AutomaticBreadcrumbs'; 

const SIDEBAR_STATE_KEY = 'sidebar_minimized_state'; 

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const authProps = usePage().props.auth;

    // 1. STATE PERSISTEN UNTUK MINIMIZE/MAXIMIZE (Hanya satu state)
    const [isMinimized, setIsMinimized] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
            // Default: false (maximize) jika belum ada di localStorage
            return savedState === 'true'; 
        }
        return false; 
    });

    // Simpan state ke localStorage setiap kali berubah
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(SIDEBAR_STATE_KEY, isMinimized.toString());
        }
    }, [isMinimized]);

    const toggleMinimize = () => setIsMinimized(prev => !prev);

    // Tentukan class lebar/margin berdasarkan state isMinimized
    const sidebarWidthClass = isMinimized ? 'sm:w-20' : 'sm:w-64';
    const mainContentMarginClass = isMinimized ? 'sm:ml-20' : 'sm:ml-64';

    return (
        <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
            
            {/* 1. SIDEBAR: Teruskan state persisten */}
            <Sidebar 
                auth={authProps} 
                isMinimized={isMinimized} 
                toggleMinimize={toggleMinimize} 
            />

            {/* 2. OVERLAY MOBILE: Muncul jika sidebar TERBUKA (!isMinimized) di mobile */}
            {/* Dipindahkan ke Layout untuk konsistensi di mobile */}
            <div 
                className={`fixed inset-0 bg-gray-600 bg-opacity-75 z-40 transition-opacity duration-300 sm:hidden ${
                    isMinimized ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
                onClick={toggleMinimize} // Klik overlay akan menutup sidebar
            ></div>

            {/* MAIN CONTENT CONTAINER */}
            <div 
                className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out w-full min-w-0 
                            ${mainContentMarginClass} 
                            ml-0`} // ml-0 di mobile
            >
                {/* 3. TOP BAR / HEADER */}
                <header className="flex flex-col bg-white dark:bg-gray-800 shadow z-20">
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        
                        {/* KIRI: Tombol Menu Mobile & Header Title */}
                        <div className="flex items-center">
                            {/* Tombol Menu Mobile: Muncul HANYA saat mobile & sidebar TERTUTUP (isMinimized=true) */}
                            {typeof window !== 'undefined' && window.innerWidth < 640 && isMinimized && (
                                <button 
                                    onClick={toggleMinimize} 
                                    className="sm:hidden mr-3 text-gray-500 dark:text-gray-400 p-1 rounded-full hover:bg-gray-100"
                                    title="Buka Menu"
                                >
                                    <Menu size={20} />
                                </button>
                            )}

                            {header && (
                                <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                    {header}
                                </h1>
                            )}
                        </div>

                        {/* KANAN: DROPDOWN PROFILE (DIJAGA) */}
                        <div className="flex items-center">
                            <Dropdown>
                                <Dropdown.Trigger>
                                    <span className="inline-flex rounded-md">
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none transition ease-in-out duration-150"
                                        >
                                            {user.nama_lengkap}
                                        </button>
                                    </span>
                                </Dropdown.Trigger>

                                <Dropdown.Content>
                                    <Dropdown.Link href="/profile">Profil</Dropdown.Link>
                                    <Dropdown.Link href="/logout" method="post" as="button">
                                        Keluar
                                    </Dropdown.Link>
                                </Dropdown.Content>
                            </Dropdown>
                        </div>
                    </div>
                    
                    {/* 4. AREA BREADCRUMBS */}
                    <div className="px-4 sm:px-6 lg:px-8 py-2 bg-white border-b border-gray-100">
                        <AutomaticBreadcrumbs />
                    </div>

                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
                    {children}
                </main>
            </div>
        </div>
    );
}