import React, { useState, useEffect } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import { Menu, ChevronDown, User, LogOut, Loader2, Sun, Moon } from 'lucide-react';
import AutomaticBreadcrumbs from '@/Components/AutomaticBreadcrumbs';

const SIDEBAR_STATE_KEY = 'sidebar_minimized_state';
const THEME_STATE_KEY = 'app_theme_preference';

// Komponen Loading dengan Animasi Fade
const PageLoader = ({ visible }) => (
    <div 
        className={`fixed inset-0 z-[200] flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
        <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-teal-600 animate-spin mb-3" />
            <span className="text-teal-700 font-medium text-sm tracking-wider animate-pulse">MEMUAT...</span>
        </div>
    </div>
);

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const authProps = usePage().props.auth;
    const flash = usePage().props.flash || {};

    // State Loading
    const [isLoading, setIsLoading] = useState(false);

    // State Theme (Dark/Light Mode)
    const [theme, setTheme] = useState('light');

    // Sidebar State
    const [isMinimized, setIsMinimized] = useState(() => {
        if (typeof window !== 'undefined') {
            const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
            return savedState === 'true';
        }
        return false;
    });

    // Inisialisasi Tema saat komponen dimuat
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem(THEME_STATE_KEY);
            // Cek local storage atau preferensi sistem (OS)
            if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                setTheme('dark');
                document.documentElement.classList.add('dark');
            } else {
                setTheme('light');
                document.documentElement.classList.remove('dark');
            }
        }
    }, []);

    // Simpan state sidebar
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(SIDEBAR_STATE_KEY, isMinimized.toString());
        }
    }, [isMinimized]);

    // Listener Router untuk Trigger Loading
    useEffect(() => {
        const start = () => setIsLoading(true);
        const finish = () => setIsLoading(false);

        const removeStart = router.on('start', start);
        const removeFinish = router.on('finish', finish);

        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    const toggleMinimize = () => setIsMinimized(prev => !prev);

    // Fungsi Toggle Tema (Pro Mode Switch)
    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark');
            document.documentElement.classList.add('dark');
            localStorage.setItem(THEME_STATE_KEY, 'dark');
        } else {
            setTheme('light');
            document.documentElement.classList.remove('dark');
            localStorage.setItem(THEME_STATE_KEY, 'light');
        }
    };

    const sidebarWidthClass = isMinimized ? 'sm:w-20' : 'sm:w-64';
    const mainContentMarginClass = isMinimized ? 'sm:ml-20' : 'sm:ml-64';

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 font-sans text-gray-800 transition-colors duration-300">
            
            {/* GLOBAL LOADER */}
            <PageLoader visible={isLoading} />

            {/* SIDEBAR */}
            <Sidebar 
                auth={authProps} 
                isMinimized={isMinimized} 
                toggleMinimize={toggleMinimize} 
            />

            {/* MOBILE OVERLAY */}
            <div 
                className={`fixed inset-0 bg-gray-900/60 z-[90] transition-opacity duration-300 sm:hidden ${
                    isMinimized ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
                }`}
                onClick={toggleMinimize}
            ></div>

            {/* MAIN CONTENT WRAPPER */}
            <div 
                className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out w-full min-w-0 ${mainContentMarginClass} ml-0`}
            >
                {/* STICKY HEADER DENGAN EFEK GLASS/GRADASI TRANSPARAN */}
                <header 
                    className="sticky top-0 z-40 w-full border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm transition-all duration-300"
                >
                    <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
                        
                        {/* Kiri: Toggle Mobile & Judul */}
                        <div className="flex items-center gap-4">
                            {typeof window !== 'undefined' && window.innerWidth < 640 && isMinimized && (
                                <button 
                                    onClick={toggleMinimize} 
                                    className="sm:hidden text-gray-500 hover:text-teal-600 transition-colors p-1"
                                >
                                    <Menu size={24} />
                                </button>
                            )}
                            
                            {header && (
                                <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight leading-tight">
                                    {header}
                                </h1>
                            )}
                        </div>

                        {/* Kanan: Profil Dropdown (Hover) */}
                        <div className="flex items-center">
                            <div className="relative group h-16 flex items-center">
                                <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors focus:outline-none">
                                    <span className="mr-2 hidden sm:inline-block">{user.nama_lengkap}</span>
                                    <span className="sm:hidden inline-block">{user.username}</span>
                                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
                                </button>

                                {/* Dropdown Content */}
                                <div className="absolute top-[3.5rem] right-0 w-56 origin-top-right bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 
                                                invisible opacity-0 translate-y-2 scale-95
                                                group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 group-hover:scale-100 
                                                transition-all duration-200 ease-out z-50 overflow-hidden">
                                    
                                    <div className="px-4 py-3 bg-gray-50/50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-600">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">Login Sebagai</p>
                                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user.email}</p>
                                    </div>
                                    
                                    <div className="py-1">
                                        <Link href={route('profile.edit')} className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                            <User className="mr-3 h-4 w-4 text-gray-400 dark:text-gray-400" /> Profil Saya
                                        </Link>

                                        {/* --- FITUR DARK MODE SWITCH (PRO MODE) --- */}
                                        <button 
                                            onClick={toggleTheme}
                                            className="w-full flex items-center justify-between px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <div className="flex items-center">
                                                {theme === 'dark' ? (
                                                    <Moon className="mr-3 h-4 w-4 text-indigo-400" />
                                                ) : (
                                                    <Sun className="mr-3 h-4 w-4 text-amber-500" />
                                                )}
                                                <span>Tema Tampilan</span>
                                            </div>
                                            {/* UI Toggle Pill */}
                                            <div className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ease-in-out cursor-pointer ${theme === 'dark' ? 'bg-teal-500' : 'bg-gray-300'}`}>
                                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-300 ease-in-out ${theme === 'dark' ? 'translate-x-4' : 'translate-x-1'}`} />
                                            </div>
                                        </button>
                                        {/* --------------------------------------- */}

                                        <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>

                                        <Link href={route('logout')} method="post" as="button" className="flex w-full items-center px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                            <LogOut className="mr-3 h-4 w-4" /> Keluar
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BREADCRUMBS AREA */}
                    <div className="px-4 sm:px-6 lg:px-8 pb-3 pt-1 text-sm text-gray-500 dark:text-gray-400">
                        <AutomaticBreadcrumbs />
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {/* Flash Messages */}
                    {(flash.success || flash.error) && (
                        <div className={`mb-6 rounded-lg p-4 border shadow-sm flex items-start animate-in fade-in slide-in-from-top-4 duration-300 ${
                            flash.success 
                                ? 'bg-teal-50 border-teal-200 text-teal-800 dark:bg-teal-900/30 dark:border-teal-800 dark:text-teal-200' 
                                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-200'
                        }`}>
                            <div className="flex-1 text-sm font-medium">
                                {flash.success || flash.error}
                            </div>
                        </div>
                    )}
                    
                    {children}
                </main>
            </div>
        </div>
    );
}