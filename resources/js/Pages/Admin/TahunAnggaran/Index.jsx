import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Edit2, Trash2, Search, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function Index({ tahunAnggarans }) {
    const { props } = usePage();
    const authUser = props?.auth?.user;
    const [search, setSearch] = useState('');

    // Client-side filter for the current page
    const filtered = tahunAnggarans.data.filter(t => {
        const q = search.toLowerCase();
        return (
            String(t.tahun_anggaran).includes(q) ||
            t.status_rkat?.toLowerCase().includes(q)
        );
    });

    // Handle delete with confirmation
    const handleDelete = (tahunAnggaran) => {
        toast.warning("Konfirmasi Hapus", {
            description: `Yakin menghapus Tahun Anggaran ${tahunAnggaran.tahun_anggaran}? Semua RKAT terkait akan terhapus.`,
            action: {
                label: "Ya, Hapus",
                onClick: () => {
                    const toastId = toast.loading("Sedang menghapus...");
                    router.delete(route('tahun.destroy', tahunAnggaran.uuid), {
                        onSuccess: () => toast.success("Berhasil Dihapus", { id: toastId, description: "Tahun Anggaran berhasil dihapus." }),
                        onError: () => toast.error("Gagal Menghapus", { id: toastId, description: "Terdapat kesalahan saat menghapus data." })
                    });
                }
            },
            cancel: {
                label: "Batal",
            }
        });
    };

    // Format date for display
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Get status badge color
    const getStatusColor = (status) => {
        switch (status) {
            case 'Drafting':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'Submission':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'Approved':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'Closed':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
        }
    };

    return (
        <AuthenticatedLayout
            user={authUser}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Tahun Anggaran</h2>}
        >
            <Head title="Tahun Anggaran" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Tahun Anggaran
                    </h1>

                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-teal-500">
                        
                        {/* Top Bar: Search, Filter, & Tambah Button */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                            <div className="relative w-full md:w-1/2">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search size={18} className="text-gray-400"/>
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Cari tahun atau status..." 
                                    value={search} 
                                    onChange={(e) => setSearch(e.target.value)} 
                                    className="pl-10 block w-full h-11 bg-gray-100 border-transparent rounded-lg focus:border-teal-500 focus:bg-white focus:ring-0 text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                />
                            </div>
                            
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                {authUser?.peran === 'Admin' && (
                                    <Link 
                                        href={route('tahun.create')} 
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition whitespace-nowrap h-11"
                                    >
                                        <Plus size={16} /> Tambah Tahun
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700">
                            <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-400 border-collapse">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 border-b border-gray-300 dark:border-gray-600 font-medium">Tahun Anggaran</th>
                                        <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium">Tanggal Mulai</th>
                                        <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium">Tanggal Akhir</th>
                                        <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium">Status</th>
                                        <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800">
                                    {filtered.length > 0 ? (
                                        filtered.map(tahun => (
                                            <tr key={tahun.tahun_anggaran} className="hover:bg-teal-50 dark:hover:bg-teal-900/30 transition-colors duration-200">
                                                <td className="px-6 py-4 border-b border-gray-300 dark:border-gray-700 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-gray-100">
                                                    {tahun.tahun_anggaran}
                                                </td>
                                                <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {formatDate(tahun.tanggal_mulai)}
                                                </td>
                                                <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {formatDate(tahun.tanggal_akhir)}
                                                </td>
                                                <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(tahun.status_rkat)}`}>
                                                        {tahun.status_rkat}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 whitespace-nowrap text-sm text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {authUser?.peran === 'Admin' && (
                                                            <>
                                                                <Link href={route('tahun.edit', tahun.uuid)}>
                                                                    <button className="p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition">
                                                                        <Edit2 size={18} />
                                                                    </button>
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDelete(tahun)}
                                                                    className="p-1 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 rounded transition"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-8 text-center text-sm text-gray-500 dark:text-gray-400 border-b border-gray-300 dark:border-gray-700">
                                                Tidak ada data tahun anggaran ditemukan.
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
