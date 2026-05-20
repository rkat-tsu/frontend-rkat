import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Plus, Search, Send, Edit2, FileDown, Eye } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/Components/ui/tooltip';
import { toast } from 'sonner';
import { usePermission } from '@/hooks/usePermission';

const formatDate = (value) => {
    if (!value) return '-';
    try {
        return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
        return value;
    }
};

export default function Index({ auth, pencairans, filters, flash = {} }) {
    const { isAdmin } = usePermission();
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');

    const applyFilters = (newSearch) => {
        router.get(
            route('pencairan.index'),
            { search: newSearch },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm !== (filters?.search || '')) {
                applyFilters(searchTerm);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleAjukan = (item) => {
        toast("Konfirmasi Pengajuan", {
            description: "Apakah Anda yakin ingin mengajukan pencairan ini?",
            action: {
                label: "Ya, Ajukan",
                onClick: () => {
                    const toastId = toast.loading("Sedang mengirim pengajuan...");
                    router.post(route('pencairan.submit', item.uuid), {}, {
                        onFinish: () => {
                            toast.dismiss(toastId);
                        }
                    });
                }
            },
            cancel: {
                label: "Batal"
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Daftar Pencairan Dana</h2>}
        >
            <Head title="Daftar Pencairan Dana" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Pencairan Dana
                    </h1>

                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-teal-500 mb-6">
                        <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
                            <div className="relative w-full lg:flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    placeholder="Cari nomor dokumen rkat atau unit..."
                                    className="pl-10 h-11 block w-full bg-gray-50 border-gray-200 rounded-lg focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-all"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                                <Link
                                    href={route('pencairan.create')}
                                    className="h-11 inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition whitespace-nowrap shadow-md bg-teal-600 hover:bg-teal-700 text-white active:scale-95"
                                >
                                    <Plus size={18} />
                                    Pengajuan Baru
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        Menampilkan <span className="font-semibold text-gray-900 dark:text-white">{pencairans.total || (pencairans.data && pencairans.data.length) || 0}</span> data
                    </div>

                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-4 text-center font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">No</th>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Nomor RKAT</th>
                                        <th className="px-6 py-4 text-left font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Unit</th>
                                        <th className="px-6 py-4 text-center font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Status</th>
                                        <th className="px-6 py-4 text-center font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Tgl Pengajuan</th>
                                        <th className="px-6 py-4 text-right font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider text-xs">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {pencairans.data && pencairans.data.length > 0 ? pencairans.data.map((item, index) => (
                                        <tr key={item.id_pencairan} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <td className="px-6 py-4 text-center font-medium text-gray-900 dark:text-white">{pencairans.from + index}</td>
                                            <td className="px-6 py-4 font-medium">
                                                {item.rkat_header ? (
                                                    <Link 
                                                        href={route('daftar-ajuan.show', item.rkat_header.uuid)}
                                                        className="text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300 hover:underline transition-colors"
                                                    >
                                                        {item.rkat_header.nomor_dokumen}
                                                    </Link>
                                                ) : (
                                                    '-'
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-850 dark:text-gray-300">{item.rkat_header?.unit?.nama_unit || '-'}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`px-2.5 py-1 inline-flex whitespace-nowrap text-xs leading-5 font-bold rounded-md 
                                                        ${item.status_pencairan === 'Draft' ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
                                                        ${item.status_pencairan === 'Disetujui_Final' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                                                        ${item.status_pencairan === 'Ditolak' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                                                        ${item.status_pencairan === 'Revisi' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                                                        ${item.status_pencairan.includes('Menunggu') ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                                                    `}>
                                                    {item.status_pencairan.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-gray-850 dark:text-gray-300">{formatDate(item.tanggal_pengajuan)}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Link
                                                                    href={route('pencairan.show', item.uuid)}
                                                                    className="inline-flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                                                                >
                                                                    <Eye size={16} />
                                                                </Link>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Detail Pencairan</TooltipContent>
                                                        </Tooltip>
 
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <a
                                                                    href={route('pencairan.export', item.uuid)}
                                                                    target="_blank"
                                                                    className="inline-flex items-center justify-center w-8 h-8 border border-blue-300 rounded-md shadow-sm text-blue-700 bg-white hover:bg-blue-50 dark:bg-gray-700 dark:text-blue-400 dark:border-blue-900/50 dark:hover:bg-blue-900/20 transition-colors"
                                                                >
                                                                    <FileDown size={16} />
                                                                </a>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Export PDF</TooltipContent>
                                                        </Tooltip>
 
                                                        {(item.status_pencairan === 'Draft' || item.status_pencairan === 'Revisi') && (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <button
                                                                        onClick={() => handleAjukan(item)}
                                                                        className="inline-flex items-center justify-center w-8 h-8 bg-teal-600 text-white rounded-md shadow-sm hover:bg-teal-700 transition"
                                                                    >
                                                                        <Send size={16} />
                                                                    </button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>Ajukan Pencairan</TooltipContent>
                                                            </Tooltip>
                                                        )}
                                                    </TooltipProvider>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                Tidak ada data pencairan yang sesuai.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
