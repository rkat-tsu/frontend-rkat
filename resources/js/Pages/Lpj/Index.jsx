import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { FileCheck2, Sparkles, Wrench } from 'lucide-react';

export default function Index({ auth }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight flex items-center gap-2">
                    <FileCheck2 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                    Laporan Pertanggungjawaban (LPJ)
                </h2>
            }
        >
            <Head title="LPJ" />

            <div className="py-12 flex flex-col items-center justify-center min-h-[70vh]">
                <div className="relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-teal-500 to-indigo-500 rounded-full blur opacity-25 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative flex items-center justify-center w-28 h-28 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-100 dark:border-gray-700">
                        <Wrench className="w-12 h-12 text-teal-500" />
                    </div>
                </div>

                <div className="mt-8 text-center max-w-md">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white flex items-center justify-center gap-2 mb-3">
                        Segera Hadir
                        <Sparkles className="w-6 h-6 text-amber-500 animate-pulse" />
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                        Modul <strong className="text-teal-600 dark:text-teal-400">Laporan Pertanggungjawaban (LPJ)</strong> sedang dalam tahap pengembangan. Kami sedang menyiapkan fitur ini untuk pengalaman yang lebih optimal.
                    </p>
                </div>

                <div className="mt-10 px-8 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm">
                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 flex items-center gap-3">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                        </span>
                        Sistem sedang dibangun...
                    </p>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
