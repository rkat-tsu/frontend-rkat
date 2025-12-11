import React, { useState } from 'react';
import { Head, Link, usePage, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Edit2, Trash2 } from 'lucide-react';

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
        if (confirm(`Apakah Anda yakin ingin menghapus Tahun Anggaran ${tahunAnggaran.tahun_anggaran}?\n\nPerhatian: Ini akan menghapus semua RKAT yang terkait dengan tahun ini.`)) {
            router.delete(route('tahun.destroy', tahunAnggaran.tahun_anggaran));
        }
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

            <div className="py-4">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-80">
                                <TextInput
                                    placeholder="Cari tahun atau status"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            {authUser?.peran === 'Admin' && (
                                <Link href={route('tahun.create')} className="ms-2">
                                    <PrimaryButton className="bg-teal-600 hover:bg-teal-700">Tambah Tahun</PrimaryButton>
                                </Link>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tahun Anggaran</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal Mulai</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tanggal Akhir</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {filtered.length > 0 ? (
                                        filtered.map(tahun => (
                                            <tr key={tahun.tahun_anggaran} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                    {tahun.tahun_anggaran}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {formatDate(tahun.tanggal_mulai)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                                    {formatDate(tahun.tanggal_akhir)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(tahun.status_rkat)}`}>
                                                        {tahun.status_rkat}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        {authUser?.peran === 'Admin' && (
                                                            <>
                                                                <Link href={route('tahun.edit', tahun.tahun_anggaran)}>
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
                                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                                Tidak ada tahun anggaran
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
