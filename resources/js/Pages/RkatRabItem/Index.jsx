import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import TextInput from '@/Components/TextInput';
import { Search, Package, ArrowLeft, ArrowRight, FileSpreadsheet } from 'lucide-react';

export default function Index({ auth, items, filters }) {
    // State untuk pencarian
    const [searchTerm, setSearchTerm] = useState(filters.search || '');

    // Handle Search dengan Delay (Debounce sederhana)
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        // Trigger reload inertia
        router.get(
            route('rkat-rab-items.index'),
            { search: value },
            { preserveState: true, replace: true }
        );
    };

    // Helper Format Rupiah
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Daftar Ajuan</h2>}
        >
            <Head title="Daftar Item RAB" />

            <div className="py-8 pb-24">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">

                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Package className="w-8 h-8 text-indigo-500" />
                        Daftar Item RAB
                    </h1>

                    {/* --- KONTAINER: FILTER & TABLE --- */}
                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-indigo-500 mb-6">

                        {/* Top Bar: Search */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                            <div className="relative w-full md:w-1/3">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    className="pl-10 h-11 block w-full bg-gray-100 border-transparent rounded-lg focus:border-indigo-500 focus:bg-white focus:ring-0 text-sm dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                                    placeholder="Cari item, unit, atau kode..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                {/* Future filters or buttons can go here */}
                            </div>
                        </div>

                        {/* Record Count */}
                        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                            Menampilkan <span className="font-semibold text-gray-900 dark:text-white">{items.total}</span> item RAB
                        </div>

                        {/* TABEL DATA */}
                        <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700">
                            <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-400 border-collapse">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 border-b border-gray-300 dark:border-gray-600 font-medium w-10 text-center">No</th>
                                        <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium">Unit Kerja & Kegiatan</th>
                                        <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium">Deskripsi Item</th>
                                        <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center">Vol</th>
                                        <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center">Satuan</th>
                                        <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-right">Harga Satuan</th>
                                        <th className="px-6 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.data.length > 0 ? (
                                        items.data.map((item, index) => (
                                            <tr key={item.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                                <td className="px-6 py-4 border-b border-gray-300 dark:border-gray-700 font-medium text-gray-900 dark:text-white text-center">
                                                    {items.from + index}
                                                </td>
                                                <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-800 dark:text-gray-200 text-xs uppercase mb-1">
                                                            {item.rkat_detail?.rkat_header?.unit?.nama_unit || 'Unit Tidak Dikenal'}
                                                        </span>
                                                        <span className="text-gray-500 text-xs line-clamp-1" title={item.rkat_detail?.judul_kegiatan}>
                                                            {item.rkat_detail?.judul_kegiatan || '-'}
                                                        </span>
                                                        <span className="text-[10px] text-indigo-500 dark:text-indigo-100 bg-indigo-100 dark:bg-indigo-800 w-fit px-1.5 py-0.5 rounded mt-1">
                                                            {item.kode_anggaran || 'Tanpa Kode'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 font-medium text-gray-900 dark:text-white">
                                                    {item.deskripsi_item}
                                                </td>
                                                <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-center">
                                                    {new Intl.NumberFormat('id-ID').format(item.volume)}
                                                </td>
                                                <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-center">
                                                    {item.satuan}
                                                </td>
                                                <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200 text-right whitespace-nowrap">
                                                    {formatRupiah(item.harga_satuan)}
                                                </td>
                                                <td className="px-6 py-4 border-b border-l border-gray-300 dark:border-gray-700 text-right whitespace-nowrap font-bold text-teal-600 dark:text-teal-400">
                                                    {formatRupiah(item.sub_total)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                                <div className="flex flex-col items-center justify-center">
                                                    <FileSpreadsheet className="w-10 h-10 text-gray-300 mb-2" />
                                                    <p>Tidak ada data item RAB ditemukan.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION */}
                        <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Menampilkan <span className="font-medium text-gray-900 dark:text-white">{items.from || 0}</span> sampai <span className="font-medium text-gray-900 dark:text-white">{items.to || 0}</span> dari <span className="font-medium text-gray-900 dark:text-white">{items.total || 0}</span> data
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {items.links.map((link, k) => (
                                    link.url ? (
                                        <Link
                                            key={k}
                                            href={link.url}
                                            className={`px-3 py-1 text-sm border rounded-md transition-colors ${link.active
                                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
                                                }`}
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    ) : (
                                        <span
                                            key={k}
                                            className="px-3 py-1 text-sm border rounded-md bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:border-gray-600"
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}