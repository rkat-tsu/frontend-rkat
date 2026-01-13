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
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Monitoring Item RAB</h2>}
        >
            <Head title="Daftar Item RAB" />

            <div className="py-6 pb-24">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* --- KONTAINER: FILTER & TABLE --- */}
                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-indigo-500">
                        
                        {/* Header & Tools */}
                        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                                    <Package className="w-5 h-5 mr-2 text-indigo-500" />
                                    Daftar Seluruh Item Belanja
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Monitoring detail rincian belanja dari seluruh pengajuan unit kerja.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <div className="relative w-full md:w-64">
                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <Search className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <TextInput
                                        type="text"
                                        className="pl-10 block w-full text-sm"
                                        placeholder="Cari item, unit, atau kode..."
                                        value={searchTerm}
                                        onChange={handleSearch}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* TABEL DATA */}
                        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                            <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-100 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th className="px-4 py-3 w-10 text-center">No</th>
                                        <th className="px-4 py-3">Unit Kerja & Kegiatan</th>
                                        <th className="px-4 py-3">Deskripsi Item</th>
                                        <th className="px-4 py-3 text-center">Vol</th>
                                        <th className="px-4 py-3 text-center">Satuan</th>
                                        <th className="px-4 py-3 text-right">Harga Satuan</th>
                                        <th className="px-4 py-3 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {items.data.length > 0 ? (
                                        items.data.map((item, index) => (
                                            <tr key={item.id} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                                <td className="px-4 py-3 text-center">
                                                    {items.from + index}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-gray-800 dark:text-gray-200 text-xs uppercase mb-1">
                                                            {item.rkat_detail?.header?.unit?.nama_unit || 'Unit Tidak Dikenal'}
                                                        </span>
                                                        <span className="text-gray-500 text-xs line-clamp-1" title={item.rkat_detail?.judul_kegiatan}>
                                                            {item.rkat_detail?.judul_kegiatan || '-'}
                                                        </span>
                                                        <span className="text-[10px] text-indigo-500 bg-indigo-50 w-fit px-1.5 py-0.5 rounded mt-1">
                                                            {item.kode_anggaran || 'Tanpa Kode'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                                                    {item.deskripsi_item}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {new Intl.NumberFormat('id-ID').format(item.volume)}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {item.satuan}
                                                </td>
                                                <td className="px-4 py-3 text-right whitespace-nowrap">
                                                    {formatRupiah(item.harga_satuan)}
                                                </td>
                                                <td className="px-4 py-3 text-right whitespace-nowrap font-bold text-teal-600">
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
                        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Menampilkan <span className="font-medium">{items.from || 0}</span> sampai <span className="font-medium">{items.to || 0}</span> dari <span className="font-medium">{items.total}</span> item
                            </p>
                            
                            <div className="flex gap-2">
                                {items.links.map((link, k) => (
                                    link.url ? (
                                        <Link
                                            key={k}
                                            href={link.url}
                                            className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                                                link.active
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