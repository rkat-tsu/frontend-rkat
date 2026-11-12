import React, { useState, useEffect, useRef } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import { Menu, ChevronDown, User, LogOut, Sun, Moon, Bell, CheckCircle2, Clock3, AlertCircle } from 'lucide-react';
import AutomaticBreadcrumbs from '@/Components/AutomaticBreadcrumbs';
import { Toaster, toast } from 'sonner';
import { usePermission } from '@/hooks/usePermission';

const SIDEBAR_STATE_KEY = 'sidebar_minimized_state';
const THEME_STATE_KEY = 'app_theme_preference';



export default function AuthenticatedLayout({ header, children }) {
    const { user, isAdmin } = usePermission();
    const authProps = usePage().props.auth;
    const flash = usePage().props.flash || {};
    const documentNotifications = usePage().props.documentNotifications || [];
    const approvalNotifications = usePage().props.approvalNotifications || [];
    const approvalNotificationCount = usePage().props.approvalNotificationCount ?? approvalNotifications.length;
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [notificationTab, setNotificationTab] = useState('pending');
    const notificationRef = useRef(null);



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

    useEffect(() => {
        if (!notificationsOpen) return;
        const handleOutsideClick = (event) => {
            if (!notificationRef.current?.contains(event.target)) {
                setNotificationsOpen(false);
            }
        };
        document.addEventListener('pointerdown', handleOutsideClick);
        return () => document.removeEventListener('pointerdown', handleOutsideClick);
    }, [notificationsOpen]);



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

    const getStatusLabel = (status, progress) => {
        if (progress && !['Disetujui_Final', 'Disetujui', 'Ditolak', 'Revisi'].includes(status)) {
            return `Menunggu ${progress}`;
        }
        const labels = {
            Draft: 'Draft', Diajukan: 'Sedang diproses', Submission: 'Sedang diproses',
            Disetujui: 'Disetujui', Disetujui_Final: 'Disetujui', Approved: 'Disetujui',
            Ditolak: 'Ditolak', Revisi: 'Perlu revisi',
        };
        return labels[status] || String(status || 'Sedang diproses').replace(/_/g, ' ');
    };
    const getStatusIcon = (status) => {
        if (['Disetujui', 'Disetujui_Final', 'Approved'].includes(status)) return <CheckCircle2 size={15} className="text-emerald-500" />;
        if (['Ditolak', 'Revisi'].includes(status)) return <AlertCircle size={15} className="text-amber-500" />;
        return <Clock3 size={15} className="text-blue-500" />;
    };

    return (
        <div className="min-h-screen flex bg-gray-200 dark:bg-gray-900 font-sans text-gray-800 transition-colors duration-300">


            <Toaster position="top-center" richColors visibleToasts={1} />

            {/* SIDEBAR */}
            <Sidebar
                auth={authProps}
                isMinimized={isMinimized}
                toggleMinimize={toggleMinimize}
            />

            {/* MOBILE OVERLAY */}
            <div
                className={`fixed inset-0 bg-gray-900/60 z-[90] transition-opacity duration-300 sm:hidden ${isMinimized ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
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
                            <div className="relative mr-2" ref={notificationRef}>
                                <button
                                    type="button"
                                    aria-label="Notifikasi progress dokumen"
                                    aria-expanded={notificationsOpen}
                                    onClick={() => setNotificationsOpen((open) => !open)}
                                    className="relative rounded-full border border-gray-300 bg-white p-2.5 text-gray-600 shadow-sm transition-colors hover:border-teal-500 hover:bg-teal-50 hover:text-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-teal-400 dark:hover:bg-gray-700 dark:hover:text-teal-300"
                                >
                                    <Bell size={20} />
                                    {approvalNotificationCount > 0 && <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[9px] font-bold leading-none text-white ring-2 ring-white dark:ring-gray-800">{approvalNotificationCount > 99 ? '99+' : approvalNotificationCount}</span>}
                                </button>
                                {notificationsOpen && (
                                    <div className="absolute right-0 top-12 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800">
                                            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white">Notifikasi Dokumen</p>
                                                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Progress pengajuan dan tugas persetujuan</p>
                                                </div>
                                                <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">{approvalNotificationCount} tugas</span>
                                            </div>
                                            <div className="grid grid-cols-2 border-b border-gray-100 p-1 dark:border-gray-700">
                                                <button type="button" onClick={() => setNotificationTab('pending')} className={`rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${notificationTab === 'pending' ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                                                    Perlu diproses <span className="ml-1">{approvalNotificationCount}</span>
                                                </button>
                                                <button type="button" onClick={() => setNotificationTab('history')} className={`rounded-lg px-2 py-2 text-xs font-semibold transition-colors ${notificationTab === 'history' ? 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                                                    Riwayat <span className="ml-1">{documentNotifications.length}</span>
                                                </button>
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {(notificationTab === 'pending' ? approvalNotifications : documentNotifications).length ? (notificationTab === 'pending' ? approvalNotifications : documentNotifications).map((notification) => (
                                                    <Link key={notification.id} href={notification.url} onClick={() => setNotificationsOpen(false)} className="flex gap-3 border-b border-gray-50 px-4 py-3 transition-colors last:border-0 hover:bg-gray-50 dark:border-gray-700/60 dark:hover:bg-gray-700/50">
                                                        <span className="mt-0.5">{notificationTab === 'pending' ? <AlertCircle size={15} className="text-rose-500" /> : getStatusIcon(notification.status)}</span>
                                                        <span className="min-w-0 flex-1">
                                                            <span className="block truncate text-sm font-semibold text-gray-800 dark:text-gray-100">{notification.title}</span>
                                                            <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">{notification.type} · {notificationTab === 'pending' ? `Perlu diproses${notification.progress ? ` · ${notification.progress}` : ''}` : getStatusLabel(notification.status, notification.progress)}</span>
                                                            {notification.date && <span className="mt-1 block text-[11px] text-gray-400">{new Date(notification.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                                                        </span>
                                                    </Link>
                                                )) : <p className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">{notificationTab === 'pending' ? 'Tidak ada dokumen yang menunggu persetujuan Anda.' : 'Belum ada riwayat dokumen.'}</p>}
                                            </div>
                                            <div className="border-t border-gray-100 p-2 text-center dark:border-gray-700">
                                                <Link href={route('notifications.index')} onClick={() => setNotificationsOpen(false)} className="block rounded-lg py-2 text-xs font-bold text-teal-700 hover:bg-teal-50 dark:text-teal-300 dark:hover:bg-teal-900/20">Lihat semua notifikasi</Link>
                                            </div>
                                    </div>
                                )}
                            </div>
                            <div className="relative group h-16 flex items-center">
                                <button className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors focus:outline-none">
                                    <div className="flex flex-col items-end mr-3">
                                        <span className="hidden sm:inline-block font-bold">{user.nama_lengkap}</span>
                                        <span className="hidden sm:inline-block text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-black leading-none mt-0.5">{user.peran?.replace(/_/g, ' ')}</span>
                                        <span className="sm:hidden inline-block">{user.username}</span>
                                    </div>
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

                {/* PAGE CONTENT DENGAN ANIMASI TRANSISI */}
                <main 
                    key={usePage().url} 
                    className="flex-1 p-4 sm:p-6 lg:p-8 animate-page-in"
                >
                    {children}
                </main>
            </div>
        </div>
    );
}
