import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Home, ShieldAlert, FileSearch, ServerCrash } from 'lucide-react';

export default function Error({ status, message }) {
    const title = {
        503: '503: Service Unavailable',
        500: '500: Server Error',
        404: '404: Page Not Found',
        403: '403: Forbidden',
    }[status] || `Error ${status}`;

    const description = {
        503: 'IZIN ✋, kami sedang melakukan pemeliharaan rutin. Silakan kembali lagi nanti.',
        500: 'IZIN ✋, terjadi kesalahan pada server kami. Kami akan segera memperbaikinya.',
        404: 'IZIN ✋, halaman yang Anda cari tidak dapat ditemukan.',
        403: 'IZIN ✋, Anda tidak memiliki izin untuk mengakses halaman ini.',
    }[status] || message || 'IZIN ✋, terjadi kesalahan yang tidak terduga.';

    const Icon = {
        503: ServerCrash,
        500: ServerCrash,
        404: FileSearch,
        403: ShieldAlert,
    }[status] || AlertCircle;

    const accentColor = {
        503: 'amber',
        500: 'rose',
        404: 'blue',
        403: 'orange',
    }[status] || 'teal';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 transition-colors duration-500">
            <Head title={title} />

            <div className="max-w-3xl w-full">
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl shadow-slate-200 dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-stretch">

                    {/* Visual Side */}
                    <div className={`w-full md:w-2/5 bg-gradient-to-br from-blue-600 to-teal-500 p-12 flex flex-col items-center justify-center text-white relative overflow-hidden`}>
                        {/* Decorative Circles */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>

                        <div className="relative z-10 animate-bounce-slow">
                            <Icon size={100} strokeWidth={1.5} />
                        </div>

                        <div className="mt-8 text-center relative z-10">
                            <span className="text-6xl font-black opacity-40 block leading-none">{status}</span>
                            <span className="text-sm font-bold uppercase tracking-[0.3em] opacity-80 mt-2 block">{title}</span>
                        </div>
                    </div>

                    {/* Content Side */}
                    <div className="w-full md:w-3/5 p-8 md:p-14 flex flex-col justify-center">
                        <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                            <AlertCircle size={14} />
                            Notification
                        </div>

                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 leading-tight">
                            {title.split(': ')[1] || title}
                        </h1>

                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-10 leading-relaxed">
                            {description}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-4">
                            <Link
                                href={route('dashboard')}
                                className="group w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 hover:scale-[1.02] active:scale-95 transition-all duration-300"
                            >
                                <Home size={18} />
                                Dashboard
                                <ArrowLeft size={18} className="rotate-180" />
                            </Link>

                            <button
                                onClick={() => window.history.back()}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                            >
                                <ArrowLeft size={20} />
                                Kembali
                            </button>
                        </div>

                        {/* System Stamp */}
                        <div className="mt-12 pt-8 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">Surat Sakti Admin</span>
                        </div>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
                    @keyframes bounce-slow {
                        0%, 100% { transform: translateY(10px); }
                        50% { transform: translateY(-15px); }
                    }
                    .animate-bounce-slow {
                        animation: bounce-slow 4s ease-in-out infinite;
                    }
                `}} />
            </div>
        </div>
    );
}
