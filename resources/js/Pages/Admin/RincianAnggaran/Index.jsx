import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Edit, Trash2, Search, ChevronDown } from 'lucide-react';

export default function Index({ items = {} }) {
    const [searchTerm, setSearchTerm] = useState('');

    // Filter pencarian
    const filtered = items.data ? items.data.filter(i => 
        (i.kode_anggaran || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.nama_anggaran || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (i.kelompok_anggaran || '').toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];

    // Helper untuk Format Rupiah
    const formatRupiah = (number) => {
        if (!number) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    // Fungsi untuk menghapus data menggunakan Inertia Router
    const handleDelete = (kode_anggaran) => {
        if (confirm('Hapus item ini?')) {
            router.delete(route('rincian.destroy', kode_anggaran));
        }
    };

    return (
        <AuthenticatedLayout header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Standar Biaya Operasional</h2>}>
            <Head title="Standar Biaya Operasional" />

            <div className="py-8">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Standar Biaya Operasional
                    </h1>

                    {/* Penyesuaian class container dengan border kuning */}
                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6 border-l-4 border-yellow-500">
                        
                        {/* Top Bar: Search, Filter, & Tambah Button */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                            <div className="relative w-full md:w-1/2">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                    <Search className="w-5 h-5 text-gray-400" />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Cari tahun atau status" 
                                    value={searchTerm} 
                                    onChange={e => setSearchTerm(e.target.value)} 
                                    className="pl-10 block w-full bg-gray-100 border-transparent rounded-lg focus:border-yellow-500 focus:bg-white focus:ring-0 text-sm"
                                />
                            </div>
                            
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition">
                                    Filter <ChevronDown size={16} />
                                </button>
                                <Link 
                                    href={route('rincian.create')} 
                                    className="flex items-center justify-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition whitespace-nowrap"
                                >
                                    Tambah Item SBO
                                </Link>
                            </div>
                        </div>

                        {/* Tabel */}
                        <div className="overflow-x-auto rounded-lg border border-gray-300 dark:border-gray-700">
                            <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-400 border-collapse">
                                <thead className="bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                                    <tr>
                                        {/* Kolom Indikator Grup */}
                                        <th className="w-8 border-b border-gray-300 dark:border-gray-600"></th>
                                        <th className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center">Kode Item</th>
                                        <th className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium">Keterangan</th>
                                        <th className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center">Kelompok</th>
                                        <th className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-left">Pagu Anggaran</th>
                                        <th className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-600 font-medium text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length > 0 ? filtered.map((item, index) => {
                                        // Logika pengecekan awalan A, B, C, dst.
                                        const currentLetter = item.kode_anggaran ? item.kode_anggaran.charAt(0).toUpperCase() : '';
                                        const prevLetter = index > 0 && filtered[index - 1].kode_anggaran ? filtered[index - 1].kode_anggaran.charAt(0).toUpperCase() : '';
                                        const isNewGroup = currentLetter !== prevLetter;

                                        return (
                                            <tr key={item.kode_anggaran} className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                                                
                                                {/* Sel Grup (A, B, dst) */}
                                                <td className="w-8 relative p-0 align-middle">
                                                    {isNewGroup && currentLetter && (
                                                        <div className="absolute top-1/2 -translate-y-1/2 -right-4 w-8 h-6 bg-yellow-400 text-white font-bold flex items-center justify-center text-xs rounded-sm z-10">
                                                            {currentLetter}
                                                        </div>
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700 text-center font-medium text-gray-900 dark:text-white">
                                                    {item.kode_anggaran}
                                                </td>
                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700 text-gray-800 dark:text-gray-200">
                                                    {item.nama_anggaran}
                                                </td>
                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700 text-center">
                                                    {item.kelompok_anggaran || item.satuan || '-'}
                                                </td>
                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700 whitespace-nowrap">
                                                    {formatRupiah(item.nominal)}
                                                </td>
                                                
                                                {/* Penyesuaian Kolom Aksi dengan Icon Saja */}
                                                <td className="px-4 py-3 border-b border-l border-gray-300 dark:border-gray-700 text-center">
                                                    <div className="flex gap-2 justify-center">
                                                        <Link
                                                            href={route('rincian.edit', item.kode_anggaran)}
                                                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </Link>
                                                        <button 
                                                            onClick={() => handleDelete(item.kode_anggaran)}
                                                            className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                                
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-8 text-center text-sm text-gray-500 border-b border-gray-300">
                                                Tidak ada data item operasional ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* PAGINATION SECTION */}
                        {items.links && (
                            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Menampilkan <span className="font-medium">{items.from || 0}</span> sampai <span className="font-medium">{items.to || 0}</span> dari <span className="font-medium">{items.total || 0}</span> item
                                </p>
                                
                                <div className="flex flex-wrap gap-2">
                                    {items.links.map((link, k) => (
                                        link.url ? (
                                            <Link
                                                key={k}
                                                href={link.url}
                                                className={`px-3 py-1 text-sm border rounded-md transition-colors ${
                                                    link.active
                                                        ? 'bg-teal-600 text-white border-teal-600'
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
                        )}
                        
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}