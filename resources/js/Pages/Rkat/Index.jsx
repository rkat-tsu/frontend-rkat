import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ArrowRight, Plus, Search, Download, Send, AlertCircle } from 'lucide-react';

const formatDate = (value) => {
    if (!value) return '-';
    try {
        return new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
        return value;
    }
};

// Tambahkan prop 'flash' untuk menangkap pesan error/success dari Controller
export default function Index({ auth, rkats, filters, tahunAnggarans, flash = {} }) {
    // State untuk menyimpan nilai filter
    const [searchTerm, setSearchTerm] = useState(filters?.search || '');
    const [tahun, setTahun] = useState(filters?.tahun || '');
    const [status, setStatus] = useState(filters?.status || '');

    // Fungsi untuk menerapkan filter ke backend
    const applyFilters = (newSearch, newTahun, newStatus) => {
        router.get(
            route('rkat.index'),
            { search: newSearch, tahun: newTahun, status: newStatus },
            { preserveState: true, preserveScroll: true, replace: true }
        );
    };

    // Handle perubahan pada input/select
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleSearchKeyDown = (e) => {
        if (e.key === 'Enter') {
            applyFilters(searchTerm, tahun, status);
        }
    };

    const handleTahunChange = (e) => {
        const val = e.target.value;
        setTahun(val);
        applyFilters(searchTerm, val, status);
    };

    const handleStatusChange = (e) => {
        const val = e.target.value;
        setStatus(val);
        applyFilters(searchTerm, tahun, val);
    };

    // Fungsi untuk mengirim dokumen (Submit)
    const handleAjukan = (id) => {
        if (confirm('Apakah Anda yakin ingin mengajukan RKAT ini? Setelah diajukan, data tidak dapat diubah kecuali dikembalikan untuk revisi.')) {
            router.post(route('rkat.submit', id));
        }
    };

    // Cek apakah tombol "Baru" harus dikunci (jika ada error periode ditutup)
    const isLocked = !!flash.error;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">Daftar RKAT</h2>}
        >
            <Head title="Daftar RKAT" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* --- BANNER NOTIFIKASI PERIODE DITUTUP --- */}
                    {flash.error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 dark:bg-red-900/20 dark:border-red-600 rounded-r-md flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={24} />
                            <div>
                                <h4 className="text-sm font-bold text-red-800 dark:text-red-300">Akses Terbatas</h4>
                                <p className="text-sm text-red-700 dark:text-red-400">{flash.error}</p>
                            </div>
                        </div>
                    )}

                    {/* --- BANNER SUCCESS --- */}
                    {flash.success && (
                        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-r-md shadow-sm animate-in fade-in slide-in-from-top-2">
                            {flash.success}
                        </div>
                    )}

                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Riwayat Pengajuan RKAT</h3>

                    {/* Filter Action Bar */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-grow">
                            {/* Input Search */}
                            <div className="relative w-full sm:w-80">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={16} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleSearchKeyDown}
                                    placeholder="Cari nomor dokumen atau unit..."
                                    className="pl-10 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                                />
                            </div>

                            {/* Dropdown Tahun */}
                            <select
                                value={tahun}
                                onChange={handleTahunChange}
                                className="block w-full sm:w-40 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                            >
                                <option value="">Semua Tahun</option>
                                {tahunAnggarans?.map((th, idx) => (
                                    <option key={idx} value={th}>{th}</option>
                                ))}
                            </select>

                            {/* Dropdown Status */}
                            <select
                                value={status}
                                onChange={handleStatusChange}
                                className="block w-full sm:w-40 rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                            >
                                <option value="">Semua Status</option>
                                <option value="Draft">Draft</option>
                                <option value="Review">Review</option>
                                <option value="Revisi">Revisi</option>
                                <option value="Disetujui">Disetujui</option>
                                <option value="Ditolak">Ditolak</option>
                            </select>
                        </div>

                        {/* Buttons Kanan */}
                        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 dark:border-gray-600 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-md text-sm hover:bg-gray-50 transition font-medium"
                            >
                                <Download size={16} />
                                Export
                            </button>
                            
                            {/* TOMBOL BARU - DIKUNCI JIKA PERIODE DITUTUP */}
                            <Link
                                href={isLocked ? '#' : route('rkat.create')}
                                onClick={(e) => isLocked && e.preventDefault()}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                    isLocked 
                                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed border border-gray-300 dark:border-gray-600' 
                                    : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
                                }`}
                            >
                                <Plus size={16} />
                                Baru
                            </Link>
                        </div>
                    </div>

                    {/* Tabel Data */}
                    <div className="overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">No</th>
                                        <th className="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Nomor Dokumen</th>
                                        <th className="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Unit</th>
                                        <th className="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Tahun</th>
                                        <th className="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Status</th>
                                        <th className="px-6 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Tanggal</th>
                                        <th className="px-6 py-3 text-right font-semibold text-gray-600 dark:text-gray-300">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {rkats.data && rkats.data.length > 0 ? rkats.data.map((item, index) => (
                                        <tr key={item.id_header} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-100">{rkats.from + index}</td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-100 font-medium">{item.nomor_dokumen}</td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-100">{item.unit?.nama_unit || '-'}</td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-100">{item.tahun_anggaran}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full 
                                                    ${item.status_persetujuan === 'Draft' ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' : ''}
                                                    ${item.status_persetujuan === 'Disetujui_Final' ? 'bg-green-100 text-green-800' : ''}
                                                    ${item.status_persetujuan === 'Ditolak' ? 'bg-red-100 text-red-800' : ''}
                                                    ${item.status_persetujuan === 'Revisi' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                    ${item.status_persetujuan.includes('Menunggu') || item.status_persetujuan === 'Review' ? 'bg-blue-100 text-blue-800' : ''}
                                                `}>
                                                    {item.status_persetujuan.replace(/_/g, ' ')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 dark:text-gray-100">{formatDate(item.tanggal_pengajuan)}</td>
                                            <td className="px-6 py-4 text-right">
                                                
                                                {/* --- KUMPULAN TOMBOL AKSI --- */}
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={route('rkat.show', item.id_header)}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600 transition-colors"
                                                    >
                                                        Lihat
                                                        <ArrowRight size={14} />
                                                    </Link>

                                                    {/* TOMBOL AJUKAN: Hanya tampil jika Draft atau Revisi */}
                                                    {(item.status_persetujuan === 'Draft' || item.status_persetujuan === 'Revisi') && (
                                                        <button
                                                            onClick={() => handleAjukan(item.id_header)}
                                                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-md shadow-sm hover:bg-green-700 transition"
                                                            title="Ajukan untuk di-review"
                                                        >
                                                            Ajukan
                                                            <Send size={14} />
                                                        </button>
                                                    )}
                                                </div>

                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="7" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                                Tidak ada data RKAT yang sesuai dengan filter.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {rkats.links && rkats.links.length > 3 && (
                        <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Menampilkan <span className="font-medium text-gray-900 dark:text-white">{rkats.from || 0}</span> sampai <span className="font-medium text-gray-900 dark:text-white">{rkats.to || 0}</span> dari <span className="font-medium text-gray-900 dark:text-white">{rkats.total || 0}</span> data
                            </div>
                            <div className="flex flex-wrap shadow-sm rounded-md">
                                {rkats.links.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.url || '#'}
                                        className={`px-3 py-2 border border-gray-200 dark:border-gray-700 text-sm ${
                                            link.active 
                                                ? 'bg-teal-600 text-white border-teal-600 z-10' 
                                                : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                        } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''} ${
                                            index === 0 ? 'rounded-l-md' : ''
                                        } ${index === rkats.links.length - 1 ? 'rounded-r-md' : ''}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        onClick={(e) => !link.url && e.preventDefault()}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}